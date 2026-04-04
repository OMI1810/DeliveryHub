import { instance } from "@/api/axios";
import { IOrder } from "@/types/order.types";

export const orderService = {
  async getMyOrders(): Promise<IOrder[]> {
    const { data } = await instance.get<IOrder[]>("/orders");
    return data;
  },

  async getOrderById(id: string): Promise<IOrder> {
    const { data } = await instance.get<IOrder>(`/orders/${id}`);
    return data;
  },
};
