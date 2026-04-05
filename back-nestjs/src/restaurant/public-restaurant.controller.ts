import { Controller, Get, NotFoundException, Param } from '@nestjs/common'
import { RestaurantService } from './restaurant.service'

@Controller('restaurants')
export class PublicRestaurantController {
	constructor(private readonly restaurantService: RestaurantService) { }

	/** Публичный список всех ресторанов (без авторизации) */
	@Get('public')
	async getPublicRestaurants() {
		return this.restaurantService.getAllPublic()
	}

	/** Публичный ресторан по ID */
	@Get(':id')
	async getPublicRestaurant(@Param('id') id: string) {
		const restaurant = await this.restaurantService.getPublicById(id)
		if (!restaurant) throw new NotFoundException('Restaurant not found')
		return restaurant
	}

	/** Публичное меню ресторана */
	@Get(':id/products')
	async getRestaurantProducts(@Param('id') id: string) {
		return this.restaurantService.getPublicProducts(id)
	}
}
