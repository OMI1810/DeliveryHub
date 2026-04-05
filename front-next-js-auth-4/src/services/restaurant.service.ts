import { instance } from '@/api/axios'
import { IRestaurant, IRestaurantCreate, IRestaurantUpdate, IPublicRestaurant } from '@/types/restaurant.types'
import { IProduct } from '@/types/product.types'

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

	async getPublicById(id: string) {
		return instance.get<IPublicRestaurant>(`/restaurants/${id}`)
	}

	async getRestaurantProducts(restaurantId: string) {
		return instance.get<IProduct[]>(`/restaurants/${restaurantId}/products`)
	}
}

export default new RestaurantService()
