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
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { OrderService } from "./order.service";
import { CreateOrderDto } from "./dto/create-order.dto";

@Controller("orders")
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  @Get("test")
  test() {
    return { message: "Order controller works!" };
  }

  @Auth()
  @Get()
  async getMyOrders(@CurrentUser("idUser") userId: string) {
    return this.orderService.getOrdersByUserId(userId);
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
  @UsePipes(new ValidationPipe())
  @HttpCode(201)
  @Post()
  async createOrder(
    @CurrentUser("idUser") userId: string,
    @Body() dto: CreateOrderDto,
  ) {
    return this.orderService.create(userId, dto);
  }

  /** Заказы для кассира */
  @Auth()
  @Get("cashier")
  async getCashierOrders(@CurrentUser("idUser") userId: string) {
    return this.orderService.getCashierOrders(userId);
  }

  /** Сменить статус заказа (кассир) */
  @Auth()
  @UsePipes(new ValidationPipe())
  @Patch(":id/status")
  async updateOrderStatus(
    @CurrentUser("idUser") userId: string,
    @Param("id") id: string,
    @Body("status") status: string,
  ) {
    return this.orderService.updateOrderStatus(userId, id, status);
  }
}
