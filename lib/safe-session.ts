import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

function isDecryptError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  return (
    error.name === "JWEDecryptionFailed" ||
    error.message.toLowerCase().includes("decryption operation failed")
  );
}

export async function getSafeServerSession() {
  try {
    return await getServerSession(authOptions);
  } catch (error) {
    if (isDecryptError(error)) {
      return null;
    }

    throw error;
  }
}
