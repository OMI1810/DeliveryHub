import { AuthDto } from "@/auth/dto/auth.dto";
import { BadRequestException, Injectable } from "@nestjs/common";
import { Prisma, Role, Status, type Shift, type User } from "@prisma/client";
import { hash } from "argon2";

import { PrismaService } from "src/prisma.service";

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  private readonly ACTIVE_COURIER_ORDER_STATUSES = [
    Status.COURIER_ACCEPTED,
    Status.FROM_DELIVERYMAN,
  ];

  private mapShiftResponse(shift: Shift) {
    return {
      idShift: shift.idShift,
      userId: shift.userId,
      startTime: shift.createAt,
      endTime: shift.stopAt,
      status: shift.stopAt ? "completed" : "active",
    };
  }

  async getUsers() {
    return this.prisma.user.findMany({
      select: {
        idUser: true,
        email: true,
        name: true,
        surname: true,
        patronymic: true,
        phone: true,
        role: true,
        password: false,
      },
    });
  }

  async getById(id: string) {
    return this.prisma.user.findUnique({
      where: {
        idUser: id,
      },
      include: {
        role: true,
      },
    });
  }

  async getByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  async create(dto: AuthDto) {
    return this.prisma.user.create({
      data: {
        email: dto.email,
        password: await hash(dto.password),
        surname: dto.surname || null,
        name: dto.name || null,
        patronymic: dto.patronymic || null,
        phone: dto.phone || null,
        role: {
          create: { role: Role.CLIENT },
        },
      },
    });
  }

  async update(id: string, data: Partial<User>) {
    return this.prisma.user.update({
      where: {
        idUser: id,
      },
      data,
    });
  }

  async getShiftState(userId: string) {
    const activeShift = await this.prisma.shift.findFirst({
      where: {
        userId,
        stopAt: null,
      },
      orderBy: {
        createAt: "desc",
      },
    });

    return {
      isOnline: Boolean(activeShift),
      shift: activeShift ? this.mapShiftResponse(activeShift) : null,
    };
  }

  async startShift(userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const activeShift = await tx.shift.findFirst({
        where: {
          userId,
          stopAt: null,
        },
        orderBy: {
          createAt: "desc",
        },
      });

      if (activeShift) {
        return {
          isOnline: true,
          shift: this.mapShiftResponse(activeShift),
        };
      }

      const createdShift = await tx.shift.create({
        data: {
          userId,
        },
      });

      return {
        isOnline: true,
        shift: this.mapShiftResponse(createdShift),
      };
    });
  }

  async stopShift(userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const activeShift = await tx.shift.findFirst({
        where: {
          userId,
          stopAt: null,
        },
        orderBy: {
          createAt: "desc",
        },
      });

      if (!activeShift) {
        return {
          isOnline: false,
          shift: null,
        };
      }

      const activeOrdersCount = await tx.order.count({
        where: {
          deliverymanId: userId,
          status: { in: this.ACTIVE_COURIER_ORDER_STATUSES },
        } as any,
      });

      if (activeOrdersCount > 0) {
        throw new BadRequestException(
          "Cannot end shift while active orders exist",
        );
      }

      const completedShift = await tx.shift.update({
        where: {
          idShift: activeShift.idShift,
        },
        data: {
          stopAt: new Date(),
        },
      });

      return {
        isOnline: false,
        shift: this.mapShiftResponse(completedShift),
      };
    });
  }

  async getOrderDiscoveryList() {
    const result = await this.prisma.$queryRaw<
      Array<{
        idOrder: string;
        pickupAddress: string | null;
        weight: number | null;
      }>
    >`
      SELECT
        o.id_order AS "idOrder",
        a.address AS "pickupAddress",
        o.weight AS "weight"
      FROM orders o
      LEFT JOIN restaurants r ON r.id_restaurant = o.restaurant_id
      LEFT JOIN address_restaurant ar ON ar.restaurant_id = r.id_restaurant
      LEFT JOIN addresses a ON a.id_address = ar.address_id
      WHERE o.status = 'COOKING' AND o.deliveryman_id IS NULL
      ORDER BY o.created_at DESC
    `;

    console.log("[DEBUG discovery] found orders:", result.length);
    return result;
  }

  private async getCourierActiveOrderByUser(
    dbClient: PrismaService | Prisma.TransactionClient,
    userId: string,
  ) {
    const activeOrder = await dbClient.order.findFirst({
      where: {
        deliverymanId: userId,
        status: { in: this.ACTIVE_COURIER_ORDER_STATUSES },
      },
      include: {
        address: {
          select: {
            address: true,
            comment: true,
            coordinateX: true,
            coordinateY: true,
          },
        },
        client: {
          select: {
            name: true,
            surname: true,
            patronymic: true,
          },
        },
        products: {
          include: {
            product: {
              select: {
                idProduct: true,
                name: true,
                description: true,
              },
            },
          },
        },
        restaurant: {
          include: {
            address: {
              include: {
                address: {
                  select: {
                    address: true,
                    coordinateX: true,
                    coordinateY: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createAt: "desc",
      },
    });

    if (!activeOrder) {
      return null;
    }

    const customerName = [
      activeOrder.client.surname,
      activeOrder.client.name,
      activeOrder.client.patronymic,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();

    const restaurantAddress = activeOrder.restaurant.address?.address;

    const result = {
      idOrder: activeOrder.idOrder,
      status: activeOrder.status,
      orderNumber: activeOrder.idOrder,
      items: activeOrder.products.map((op) => ({
        idProduct: op.product.idProduct,
        name: op.product.name,
        description: op.product.description,
      })),
      customerName: customerName || "Unknown customer",
      customerAddress: activeOrder.address.address,
      customerCoordinates: {
        lat: activeOrder.address.coordinateY,
        lon: activeOrder.address.coordinateX,
      },
      restaurantAddress: restaurantAddress?.address ?? "Не указан",
      restaurantCoordinates: restaurantAddress
        ? {
            lat: restaurantAddress.coordinateY,
            lon: restaurantAddress.coordinateX,
          }
        : null,
      comments: activeOrder.address.comment,
    };

    console.log(
      "[getCourierActiveOrderByUser] result:",
      JSON.stringify(
        {
          idOrder: result.idOrder,
          status: result.status,
          restaurantAddress: result.restaurantAddress,
          restaurantCoordinates: result.restaurantCoordinates,
          customerAddress: result.customerAddress,
          customerCoordinates: result.customerCoordinates,
        },
        null,
        2,
      ),
    );

    return result;
  }

  async getActiveCourierOrder(userId: string) {
    return this.getCourierActiveOrderByUser(this.prisma, userId);
  }

  async acceptOrder(userId: string, orderId: string) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const activeShift = await tx.shift.findFirst({
          where: {
            userId,
            stopAt: null,
          },
          select: {
            idShift: true,
          },
          orderBy: {
            createAt: "desc",
          },
        });

        if (!activeShift) {
          throw new BadRequestException(
            "Courier must be online to accept orders",
          );
        }

        const activeCourierOrder = await tx.order.findFirst({
          where: {
            deliverymanId: userId,
            status: { in: this.ACTIVE_COURIER_ORDER_STATUSES },
          },
          select: {
            idOrder: true,
          },
        } as any);

        if (activeCourierOrder && activeCourierOrder.idOrder !== orderId) {
          throw new BadRequestException("Courier already has an active order");
        }

        if (activeCourierOrder?.idOrder === orderId) {
          return this.getCourierActiveOrderByUser(tx, userId);
        }

        const updatedOrder = await tx.order.updateMany({
          where: {
            idOrder: orderId,
            status: Status.COOKING,
            deliverymanId: null,
          },
          data: {
            status: Status.COURIER_ACCEPTED,
            deliverymanId: userId,
          },
        } as any);

        if (updatedOrder.count === 0) {
          const staleOrder = (await tx.order.findUnique({
            where: {
              idOrder: orderId,
            },
            select: {
              idOrder: true,
              status: true,
              deliverymanId: true,
            },
          } as any)) as any;

          if (!staleOrder) {
            throw new BadRequestException("Order not found");
          }

          if (
            this.ACTIVE_COURIER_ORDER_STATUSES.includes(staleOrder.status) &&
            staleOrder.deliverymanId === userId
          ) {
            return this.getCourierActiveOrderByUser(tx, userId);
          }

          throw new BadRequestException(
            "Order already accepted or unavailable",
          );
        }

        return this.getCourierActiveOrderByUser(tx, userId);
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new BadRequestException("Courier already has an active order");
      }

      throw error;
    }
  }

  async completeOrderDelivery(userId: string, orderId: string) {
    return this.prisma.$transaction(async (tx) => {
      const order = (await tx.order.findUnique({
        where: {
          idOrder: orderId,
        },
        select: {
          idOrder: true,
          status: true,
          deliverymanId: true,
        },
      } as any)) as any;

      if (!order) {
        throw new BadRequestException("Order not found");
      }

      if (order.deliverymanId !== userId) {
        throw new BadRequestException("Order is assigned to another courier");
      }

      if (order.status === Status.DELIVERED) {
        return {
          idOrder: order.idOrder,
          status: order.status,
        };
      }

      if (!this.ACTIVE_COURIER_ORDER_STATUSES.includes(order.status)) {
        throw new BadRequestException("Order is not in delivery");
      }

      const deliveredOrder = await tx.order.update({
        where: {
          idOrder: order.idOrder,
        },
        data: {
          status: Status.DELIVERED,
        },
        select: {
          idOrder: true,
          status: true,
        },
      });

      return deliveredOrder;
    });
  }

  /** Добавить роль DELIVERYMAN пользователю (не удаляя существующие роли) */
  async becomeDeliveryman(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { idUser: userId },
      include: { role: true },
    });

    if (!user) {
      throw new BadRequestException("User not found");
    }

    const hasDeliverymanRole = user.role.some(
      (r) => r.role === Role.DELIVERYMAN,
    );

    if (hasDeliverymanRole) {
      return {
        message: "Already a deliveryman",
        roles: user.role.map((r) => r.role),
      };
    }

    await this.prisma.userRole.create({
      data: {
        userId,
        role: Role.DELIVERYMAN,
      },
    });

    return {
      message: "Deliveryman role added",
      roles: [...user.role.map((r) => r.role), Role.DELIVERYMAN],
    };
  }
}
