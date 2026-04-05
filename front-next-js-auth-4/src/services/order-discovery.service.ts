import { instance } from "@/api/axios";

export interface IOrderDiscoveryItem {
  idOrder: string;
  pickupAddress: string | null;
  weight: number | null;
}

export interface IOrderActiveItem {
  idOrder: string;
  status: "COURIER_ACCEPTED" | "FROM_DELIVERYMAN" | "DELIVERED";
  orderNumber: string;
  items: Array<{
    idProduct: string;
    name: string;
    description: string | null;
  }>;
  customerName: string;
  customerAddress: string;
  comments: string | null;
}

class OrderDiscoveryService {
  private _BASE_URL = "/users/orders/discovery";

  async fetchOrders() {
    return instance.get<IOrderDiscoveryItem[]>(this._BASE_URL);
  }

  async fetchActiveOrder() {
    return instance.get<IOrderActiveItem | null>("/users/orders/active");
  }

  async acceptOrder(orderId: string) {
    return instance.post<IOrderActiveItem>(`/users/orders/${orderId}/accept`);
  }

  async completeOrder(orderId: string) {
    return instance.post<{ idOrder: string; status: "DELIVERED" }>(
      `/users/orders/${orderId}/delivered`,
    );
  }
}

export default new OrderDiscoveryService();
