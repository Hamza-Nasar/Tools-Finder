import { timingSafeEqual } from "crypto";
import { created, handleApiError, parseRequestBody } from "@/lib/api";
import { AppError } from "@/lib/errors";
import { env } from "@/lib/env";
import { UserService } from "@/lib/services/user-service";
import { firstAdminSetupSchema } from "@/lib/validators/user";

function tokenMatches(inputToken: string) {
  const configuredToken = env.ADMIN_SETUP_TOKEN;

  if (!configuredToken) {
    return false;
  }

  const input = Buffer.from(inputToken);
  const expected = Buffer.from(configuredToken);

  return input.length === expected.length && timingSafeEqual(input, expected);
}

export async function POST(request: Request) {
  try {
    const payload = await parseRequestBody(request, firstAdminSetupSchema);

    if (!tokenMatches(payload.token)) {
      throw new AppError(404, "First admin setup is unavailable.", "ADMIN_SETUP_UNAVAILABLE");
    }

    const user = await UserService.setupFirstAdmin({
      name: payload.name,
      email: payload.email,
      password: payload.password
    });

    return created({
      user
    });
  } catch (error) {
    return handleApiError(error);
  }
}
