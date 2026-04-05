import { instance } from '@/api/axios'
import { ICashier, ICreateCashier, ICashierOrder } from '@/types/cashier.types'

class CashierService {
	private _CASHIERS = (orgId: string, restId: string) =>
		`/organizations/${orgId}/restaurants/${restId}/cashiers`

	async getCashiers(orgId: string, restId: string) {
		return instance.get<ICashier[]>(this._CASHIERS(orgId, restId))
	}

	async create(orgId: string, restId: string, data: ICreateCashier) {
		return instance.post<ICashier>(this._CASHIERS(orgId, restId), data)
	}

	async remove(orgId: string, restId: string, cashierId: string) {
		return instance.delete(`${this._CASHIERS(orgId, restId)}/${cashierId}`)
	}

	// Cashier-facing methods
	async getOrders() {
		return instance.get<ICashierOrder[]>('/orders/cashier')
	}

	async updateOrderStatus(orderId: string, status: string) {
		return instance.patch<ICashierOrder>(`/orders/${orderId}/status`, { status })
	}
}

export default new CashierService()
