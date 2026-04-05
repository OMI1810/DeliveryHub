import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Role, Status } from "@prisma/client";
import { PrismaService } from "@/prisma.service";
import { CreateOrderDto } from "./dto/create-order.dto";

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  /** Создать заказ */
  async create(userId: string, dto: CreateOrderDto) {
    if (dto.items.length === 0) {
      throw new BadRequestException("Заказ не может быть пустым");
    }

    // Проверяем что ресторан существует
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { idRestaurant: dto.restaurantId },
    });

    if (!restaurant) {
      throw new NotFoundException("Ресторан не найден");
    }

    // Проверяем что адрес принадлежит пользователю
    const addressRelation = await this.prisma.addressUser.findUnique({
      where: {
        userId_addressId: {
          userId,
          addressId: dto.addressId,
        },
      },
    });

    if (!addressRelation) {
      throw new NotFoundException("Адрес не найден");
    }

    // Проверяем что все продукты существуют и принадлежат ресторану
    const products = await this.prisma.product.findMany({
      where: {
        idProduct: { in: dto.items.map((item) => item.productId) },
        restaurantId: dto.restaurantId,
      },
    });

    if (products.length !== dto.items.length) {
      throw new BadRequestException("Один или несколько продуктов не найдены");
    }

    // Создаём заказ с продуктами в транзакции
    const order = await this.prisma.$transaction(async (tx) => {
      // Создаём заказ
      const createdOrder = await tx.order.create({
        data: {
          clientId: userId,
          restarauntId: dto.restaurantId,
          addressId: dto.addressId,
          status: "CREATED",
          payStatus: false,
        },
      });

      // Добавляем продукты в заказ
      for (const item of dto.items) {
        const product = products.find((p) => p.idProduct === item.productId);

        await tx.orderProduct.create({
          data: {
            orderId: createdOrder.idOrder,
            productId: item.productId,
            quantity: item.quantity,
            price: product.price,
          },
        });
      }

      // Возвращаем заказ с продуктами
      return tx.order.findUnique({
        where: { idOrder: createdOrder.idOrder },
        include: {
          products: {
            include: {
              product: true,
            },
          },
          address: true,
          restaraunt: true,
        },
      });
    });

    return order;
  }

  /** Получить все заказы пользователя */
  async getOrdersByUserId(userId: string) {
    return this.prisma.order.findMany({
      where: { clientId: userId },
      include: {
        products: {
          include: {
            product: true,
          },
        },
        address: true,
        restaraunt: true,
      },
      orderBy: { createAt: "desc" },
    });
  }

  /** Получить заказ по ID */
  async getOrderById(id: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { idOrder: id },
      include: {
        products: {
          include: {
            product: true,
          },
        },
        address: true,
        restaraunt: true,
      },
    });

    if (!order) {
      throw new NotFoundException("Заказ не найден");
    }

    if (order.clientId !== userId) {
      throw new NotFoundException("Заказ не найден");
    }

    return order;
  }

  /** Диагностика: информация о кассире */
  async getCashierDebug(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { idUser: userId },
      include: {
        cashierRestaurant: true,
        role: true,
      },
    });

    const orders = user?.cashierRestaurant
      ? await this.prisma.order.findMany({
          where: { restarauntId: user.cashierRestaurantId },
          select: {
            idOrder: true,
            restarauntId: true,
            status: true,
            createAt: true,
          },
        })
      : [];

    const allOrders = await this.prisma.order.findMany({
      select: {
        idOrder: true,
        restarauntId: true,
        status: true,
        createAt: true,
      },
    });

    return {
      user: user
        ? {
            idUser: user.idUser,
            email: user.email,
            cashierRestaurantId: user.cashierRestaurantId,
            cashierRestaurant: user.cashierRestaurant
              ? {
                  idRestaurant: user.cashierRestaurant.idRestaurant,
                  name: user.cashierRestaurant.name,
                }
              : null,
            roles: user.role.map((r) => r.role),
          }
        : null,
      ordersForCashierRestaurant: orders,
      allOrdersInDb: allOrders,
      matchCheck: user?.cashierRestaurantId
        ? allOrders.filter((o) => o.restarauntId === user.cashierRestaurantId)
        : [],
    };
  }

  /** Заказы ресторана для кассира */
  async getCashierOrders(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { idUser: userId },
      include: {
        cashierRestaurant: true,
        role: true,
      },
    });

    if (!user?.cashierRestaurant) {
      throw new ForbiddenException("Not a cashier or no restaurant assigned");
    }

    const isCashier = user.role.some((r) => r.role === Role.CASHIER);

    if (!isCashier) {
      throw new ForbiddenException("Not a cashier");
    }

    const orders = await this.prisma.order.findMany({
      where: { restarauntId: user.cashierRestaurantId },
      include: {
        products: {
          include: {
            product: true,
          },
        },
        address: true,
        restaraunt: true,
        client: {
          select: {
            idUser: true,
            name: true,
            surname: true,
            phone: true,
          },
        },
      },
      orderBy: { createAt: "desc" },
    });

    return orders;
  }

  /** Сменить статус заказа (кассир) */
  async updateOrderStatus(userId: string, orderId: string, status: string) {
    const user = await this.prisma.user.findUnique({
      where: { idUser: userId },
      include: { cashierRestaurant: true, role: true },
    });

    if (!user?.cashierRestaurant) {
      throw new ForbiddenException("Not a cashier");
    }

    const order = await this.prisma.order.findUnique({
      where: { idOrder: orderId },
    });

    if (!order) {
      throw new NotFoundException("Order not found");
    }

    if (order.restarauntId !== user.cashierRestaurantId) {
      throw new ForbiddenException("Order does not belong to your restaurant");
    }

    await this.prisma.$executeRaw`
      UPDATE "orders" SET status = ${status}::"Status"
      WHERE id_order = ${orderId}
    `;

    return this.prisma.order.findUnique({
      where: { idOrder: orderId },
      include: {
        products: { include: { product: true } },
        address: true,
        restaraunt: true,
      },
    });
  }

  /** Кассир отдаёт заказ курьеру (COURIER_ACCEPTED → FROM_DELIVERYMAN) */
  async handoverToCourier(userId: string, orderId: string) {
    const user = await this.prisma.user.findUnique({
      where: { idUser: userId },
      include: { cashierRestaurant: true, role: true },
    });

    if (!user?.cashierRestaurant) {
      throw new ForbiddenException("Not a cashier");
    }

    const order = await this.prisma.order.findUnique({
      where: { idOrder: orderId },
    });

    if (!order) {
      throw new NotFoundException("Order not found");
    }

    if (order.restarauntId !== user.cashierRestaurantId) {
      throw new ForbiddenException("Order does not belong to your restaurant");
    }

    if (order.status !== Status.COURIER_ACCEPTED) {
      throw new BadRequestException(
        "Order must be in COURIER_ACCEPTED status to handover",
      );
    }

    // Use raw SQL to bypass Prisma enum bug
    await this.prisma.$executeRawUnsafe(
      `UPDATE "orders" SET status = 'FROM_DELIVERYMAN' WHERE id_order = $1`,
      orderId,
    );

    return this.prisma.order.findUnique({
      where: { idOrder: orderId },
      include: {
        products: { include: { product: true } },
        address: true,
        restaraunt: true,
      },
    });
  }
}
