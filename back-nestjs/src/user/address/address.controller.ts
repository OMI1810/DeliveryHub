import { Auth } from "@/auth/decorators/auth.decorator";
import { CurrentUser } from "@/auth/decorators/user.decorator";
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { Role } from "@prisma/client";
import { AddressService } from "./address.service";
import { CreateAddressDto } from "./dto/create-address.dto";
import { UpdateAddressDto } from "./dto/update-address.dto";

@Controller("users/addresses")
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Auth()
  @Get()
  async getAll(@CurrentUser("idUser") userId: string) {
    return this.addressService.getAllByUserId(userId);
  }

  @Auth()
  @Get(":id")
  async getById(
    @CurrentUser("idUser") userId: string,
    @Param("id") id: string,
  ) {
    return this.addressService.getById(id, userId);
  }

  // Для тестирования — создание адреса для произвольного пользователя (только GOD)
  @Auth(Role.GOD)
  @UsePipes(new ValidationPipe())
  @HttpCode(201)
  @Post("by-user/:userId")
  async createByUserId(
    @Param("userId") userId: string,
    @Body() dto: CreateAddressDto,
  ) {
    return this.addressService.create(userId, dto);
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(201)
  @Auth()
  @Post()
  async create(
    @CurrentUser("idUser") userId: string,
    @Body() dto: CreateAddressDto,
  ) {
    return this.addressService.create(userId, dto);
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Auth()
  @Patch(":id")
  async update(
    @CurrentUser("idUser") userId: string,
    @Param("id") id: string,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.addressService.update(id, userId, dto);
  }

  @HttpCode(200)
  @Auth()
  @Delete(":id")
  async remove(@CurrentUser("idUser") userId: string, @Param("id") id: string) {
    return this.addressService.remove(id, userId);
  }
}
