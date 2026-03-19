import { ZodError } from "zod";
import { isAppError } from "@/lib/errors";

export interface ActionState<T = undefined> {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  data?: T;
}

export const initialActionState: ActionState = {
  status: "idle"
};

export function toActionState<T = undefined>(
  error: unknown,
  fallbackMessage = "Something went wrong."
): ActionState<T> {
  if (error instanceof ZodError) {
    return {
      status: "error",
      message: "Please correct the highlighted fields.",
      fieldErrors: error.flatten().fieldErrors
    };
  }

  if (isAppError(error)) {
    return {
      status: "error",
      message: error.message
    };
  }

  if (error instanceof Error && error.message) {
    return {
      status: "error",
      message: error.message
    };
  }

  return {
    status: "error",
    message: fallbackMessage
  };
}
