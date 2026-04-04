import { instance } from '@/api/axios'
import { IRestaurant, IRestaurantCreate } from '@/types/restaurant.types'

class RestaurantService {
	private _BASE = (orgId: string) => `/organizations/${orgId}/restaurants`

	async getAll(orgId: string) {
		return instance.get<IRestaurant[]>(this._BASE(orgId))
	}

	async getById(orgId: string, id: string) {
		return instance.get<IRestaurant>(`${this._BASE(orgId)}/${id}`)
	}

	async create(orgId: string, data: IRestaurantCreate) {
		return instance.post<IRestaurant>(this._BASE(orgId), data)
	}
}

export default new RestaurantService()
