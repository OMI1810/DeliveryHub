import { Auth } from "@/auth/decorators/auth.decorator";
import { CurrentUser } from "@/auth/decorators/user.decorator";
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import { Role } from "@prisma/client";
import { UserService } from "./user.service";

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Auth()
  @Get("profile")
  async getProfile(@CurrentUser("idUser") id: string) {
    return this.userService.getById(id);
  }

  @HttpCode(200)
  @Auth()
  @Patch("update-email")
  async updateEmail(
    @CurrentUser("idUser") userId: string,
    @Body() dto: { email: string },
  ) {
    return this.userService.update(userId, { email: dto.email });
  }

  @Auth(Role.GOD)
  @Get("list")
  async getList() {
    return this.userService.getUsers();
  }

  @Auth(Role.DELIVERYMAN)
  @Get("shift")
  async getShiftState(@CurrentUser("idUser") userId: string) {
    return this.userService.getShiftState(userId);
  }

  @Auth(Role.DELIVERYMAN)
  @HttpCode(200)
  @Post("shift/start")
  async startShift(@CurrentUser("idUser") userId: string) {
    return this.userService.startShift(userId);
  }

  @Auth(Role.DELIVERYMAN)
  @HttpCode(200)
  @Post("shift/stop")
  async stopShift(@CurrentUser("idUser") userId: string) {
    return this.userService.stopShift(userId);
  }

  @Auth(Role.DELIVERYMAN)
  @Get("orders/discovery")
  async getOrdersDiscovery() {
    return this.userService.getOrderDiscoveryList();
  }

  @Auth(Role.DELIVERYMAN)
  @Get("orders/active")
  async getActiveOrder(@CurrentUser("idUser") userId: string) {
    return this.userService.getActiveCourierOrder(userId);
  }

  @Auth(Role.DELIVERYMAN)
  @HttpCode(200)
  @Post("orders/:orderId/accept")
  async acceptOrder(
    @CurrentUser("idUser") userId: string,
    @Param("orderId") orderId: string,
  ) {
    return this.userService.acceptOrder(userId, orderId);
  }

  @Auth(Role.DELIVERYMAN)
  @HttpCode(200)
  @Post("orders/:orderId/delivered")
  async completeOrderDelivery(
    @CurrentUser("idUser") userId: string,
    @Param("orderId") orderId: string,
  ) {
    return this.userService.completeOrderDelivery(userId, orderId);
  }

  @Auth()
  @HttpCode(200)
  @Post("become-deliveryman")
  async becomeDeliveryman(@CurrentUser("idUser") userId: string) {
    return this.userService.becomeDeliveryman(userId);
  }
}
