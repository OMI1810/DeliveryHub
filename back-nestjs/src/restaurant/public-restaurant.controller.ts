import { Controller, Get } from '@nestjs/common'
import { RestaurantService } from './restaurant.service'

@Controller('restaurants')
export class PublicRestaurantController {
	constructor(private readonly restaurantService: RestaurantService) {}

	/** Публичный список всех ресторанов (без авторизации) */
	@Get('public')
	async getPublicRestaurants() {
		return this.restaurantService.getAllPublic()
	}
}
