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
  Query,
} from "@nestjs/common";
import { Role } from "@prisma/client";
import { OrderService } from "./order.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderStatusDto } from "./dto/update-order-status.dto";
import { PaginationDto } from "./dto/pagination.dto";

@Controller("orders")
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Auth()
  @Get()
  async getMyOrders(
    @CurrentUser("idUser") userId: string,
    @Query() pagination?: PaginationDto,
  ) {
    return this.orderService.getOrdersByUserId(userId, pagination);
  }

  // === Cashier endpoints (before :id route!) ===

  @Auth(Role.CASHIER)
  @Get("cashier")
  async getCashierOrders(
    @CurrentUser("idUser") userId: string,
    @Query() pagination?: PaginationDto,
  ) {
    return this.orderService.getCashierOrders(userId, pagination);
  }

  @Auth()
  @Get(":id")
  async getOrderById(
    @CurrentUser("idUser") userId: string,
    @Param("id") id: string,
  ) {
    return this.orderService.getOrderById(id, userId);
  }

  @Auth()
  @HttpCode(201)
  @Post()
  async createOrder(
    @CurrentUser("idUser") userId: string,
    @Body() dto: CreateOrderDto,
  ) {
    return this.orderService.create(userId, dto);
  }

  @Auth(Role.CASHIER)
  @Patch(":orderId/status")
  async updateOrderStatus(
    @CurrentUser("idUser") userId: string,
    @Param("orderId") orderId: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.orderService.updateOrderStatus(userId, orderId, dto);
  }

  @Auth(Role.CASHIER)
  @HttpCode(200)
  @Patch(":orderId/handover")
  async handoverToCourier(
    @CurrentUser("idUser") userId: string,
    @Param("orderId") orderId: string,
  ) {
    return this.orderService.handoverToCourier(userId, orderId);
  }
}
