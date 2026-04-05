import { instance } from '@/api/axios'
import { IRestaurant, IRestaurantCreate, IRestaurantUpdate, IPublicRestaurant } from '@/types/restaurant.types'

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

	async update(orgId: string, id: string, data: IRestaurantUpdate) {
		return instance.patch<IRestaurant>(`${this._BASE(orgId)}/${id}`, data)
	}

	async remove(orgId: string, id: string) {
		return instance.delete(`${this._BASE(orgId)}/${id}`)
	}

	async getAllPublic() {
		return instance.get<IPublicRestaurant[]>('/restaurants/public')
	}
}

export default new RestaurantService()
