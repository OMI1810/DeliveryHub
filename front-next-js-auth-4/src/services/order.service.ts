import { instance } from "@/api/axios";
import { IOrder } from "@/types/order.types";

export interface IPaginatedOrders {
  orders: IOrder[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IOrdersQuery {
  page?: number;
  limit?: number;
}

class OrderService {
  async getMyOrders(query?: IOrdersQuery): Promise<IPaginatedOrders> {
    const { data } = await instance.get<IPaginatedOrders>("/orders", {
      params: query,
    });
    return data;
  }

  async getOrderById(id: string): Promise<IOrder> {
    const { data } = await instance.get<IOrder>(`/orders/${id}`);
    return data;
  }
}

export const orderService = new OrderService();
