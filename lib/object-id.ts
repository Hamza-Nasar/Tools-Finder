import mongoose from "mongoose";
import { AppError } from "@/lib/errors";

const { Types } = mongoose;

export function toObjectId(value: string, fieldName = "id") {
  if (!Types.ObjectId.isValid(value)) {
    throw new AppError(400, `Invalid ${fieldName}.`, "INVALID_ID");
  }

  return new Types.ObjectId(value);
}
