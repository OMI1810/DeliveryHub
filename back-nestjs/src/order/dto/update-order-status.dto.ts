import { IsEnum } from "class-validator";
import { Status } from "@prisma/client";

export class UpdateOrderStatusDto {
  @IsEnum(Status)
  status: Status;
}
