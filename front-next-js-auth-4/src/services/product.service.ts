import { instance } from '@/api/axios'
import { IProduct, IProductCreate, IProductUpdate } from '@/types/product.types'

class ProductService {
	private _BASE = (orgId: string, restId: string) =>
		`/organizations/${orgId}/restaurants/${restId}/products`

	async getAll(orgId: string, restId: string) {
		return instance.get<IProduct[]>(this._BASE(orgId, restId))
	}

	async getById(orgId: string, restId: string, id: string) {
		return instance.get<IProduct>(`${this._BASE(orgId, restId)}/${id}`)
	}

	async create(orgId: string, restId: string, data: IProductCreate) {
		return instance.post<IProduct>(this._BASE(orgId, restId), data)
	}

	async update(orgId: string, restId: string, id: string, data: IProductUpdate) {
		return instance.patch<IProduct>(`${this._BASE(orgId, restId)}/${id}`, data)
	}

	async remove(orgId: string, restId: string, id: string) {
		return instance.delete(`${this._BASE(orgId, restId)}/${id}`)
	}
}

export default new ProductService()
