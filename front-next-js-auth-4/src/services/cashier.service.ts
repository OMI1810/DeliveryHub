import { instance } from "@/api/axios";
import {
  ICashier,
  ICreateCashier,
  IAssignCashierResult,
  ICashierOrder,
} from "@/types/cashier.types";

export interface ICashierOrdersQuery {
  page?: number;
  limit?: number;
}

export interface IPaginatedCashierOrders {
  orders: ICashierOrder[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

class CashierService {
  private _CASHIERS = (orgId: string, restId: string) =>
    `/organizations/${orgId}/restaurants/${restId}/cashiers`;

  async getCashiers(orgId: string, restId: string) {
    return instance.get<ICashier[]>(this._CASHIERS(orgId, restId));
  }

  async create(orgId: string, restId: string, data: ICreateCashier) {
    return instance.post<ICashier>(this._CASHIERS(orgId, restId), data);
  }

  async assignByEmail(orgId: string, restId: string, email: string) {
    return instance.post<IAssignCashierResult>(
      `${this._CASHIERS(orgId, restId)}/assign`,
      { email },
    );
  }

  async remove(orgId: string, restId: string, cashierId: string) {
    return instance.delete(`${this._CASHIERS(orgId, restId)}/${cashierId}`);
  }

  // Cashier-facing methods
  async getOrders(query?: ICashierOrdersQuery) {
    return instance.get<IPaginatedCashierOrders | ICashierOrder[]>(
      "/orders/cashier",
      { params: query },
    );
  }

  async updateOrderStatus(orderId: string, status: string) {
    return instance.patch<ICashierOrder>(`/orders/${orderId}/status`, {
      status,
    });
  }

  async handoverToCourier(orderId: string) {
    return instance.patch<ICashierOrder>(`/orders/${orderId}/handover`);
  }
}

export default new CashierService();
