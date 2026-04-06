import { IsEnum } from "class-validator";
import { Status } from "@prisma/client";

export class UpdateOrderStatusDto {
  @IsEnum(Status, {
    message: `Status must be one of: ${Object.values(Status).join(", ")}`,
  })
  status: Status;
}
