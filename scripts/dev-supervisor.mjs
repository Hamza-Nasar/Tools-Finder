import { spawn } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const isWindows = process.platform === "win32";
const baseDelayMs = Number.parseInt(process.env.DEV_SERVER_RESTART_DELAY_MS ?? "1500", 10);
const maxDelayMs = Number.parseInt(process.env.DEV_SERVER_MAX_RESTART_DELAY_MS ?? "10000", 10);
const usePolling = (process.env.DEV_SERVER_USE_POLLING ?? (isWindows ? "1" : "0")) !== "0";

let activeChild = null;
let restartCount = 0;
let shuttingDown = false;
let restartTimer = null;

function getRestartDelay() {
  return Math.min(baseDelayMs * Math.max(restartCount, 1), maxDelayMs);
}

function createChildEnv() {
  const env = { ...process.env };

  if (usePolling) {
    env.WATCHPACK_POLLING = "true";
    env.CHOKIDAR_USEPOLLING = "1";
  }

  return env;
}

function clearRestartTimer() {
  if (restartTimer) {
    clearTimeout(restartTimer);
    restartTimer = null;
  }
}

function stopChild(signal) {
  if (!activeChild || activeChild.exitCode !== null || activeChild.killed) {
    return;
  }

  activeChild.kill(signal);
}

function scheduleRestart(code, signal) {
  if (shuttingDown) {
    return;
  }

  restartCount += 1;
  const delayMs = getRestartDelay();
  const reason = signal ? `signal ${signal}` : `code ${code ?? "unknown"}`;
  console.error(`[dev-supervisor] next dev exited with ${reason}. Restarting in ${delayMs}ms.`);

  restartTimer = setTimeout(() => {
    restartTimer = null;
    startServer();
  }, delayMs);
}

function startServer() {
  clearRestartTimer();

  const command = isWindows ? process.env.ComSpec ?? "cmd.exe" : "npm";
  const args = isWindows ? ["/d", "/s", "/c", "npm run dev:next"] : ["run", "dev:next"];

  activeChild = spawn(command, args, {
    cwd: rootDir,
    env: createChildEnv(),
    shell: false,
    stdio: "inherit"
  });

  activeChild.once("spawn", () => {
    if (restartCount === 0) {
      console.log(`[dev-supervisor] starting next dev${usePolling ? " with polling enabled" : ""}.`);
    } else {
      console.log(`[dev-supervisor] restart attempt ${restartCount}${usePolling ? " with polling enabled" : ""}.`);
    }
  });

  activeChild.once("error", (error) => {
    console.error("[dev-supervisor] failed to start next dev:", error);
    scheduleRestart(null, null);
  });

  activeChild.once("exit", (code, signal) => {
    activeChild = null;
    scheduleRestart(code, signal);
  });
}

function shutdown(signal) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  clearRestartTimer();
  stopChild(signal);

  setTimeout(() => {
    process.exit(0);
  }, 250);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

startServer();
