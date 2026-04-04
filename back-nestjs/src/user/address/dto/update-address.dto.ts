import { IsOptional, IsString } from "class-validator";

export class UpdateAddressDto {
  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  entrance?: string;

  @IsOptional()
  @IsString()
  doorphone?: string;

  @IsOptional()
  @IsString()
  flat?: string;

  @IsOptional()
  @IsString()
  floor?: string;

  @IsOptional()
  @IsString()
  comment?: string;
}
