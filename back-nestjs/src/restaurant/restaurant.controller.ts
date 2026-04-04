import { Auth } from '@/auth/decorators/auth.decorator'
import { CurrentUser } from '@/auth/decorators/user.decorator'
import {
	Body,
	Controller,
	Get,
	Param,
	Post,
	UsePipes,
	ValidationPipe
} from '@nestjs/common'
import { CreateRestaurantDto } from './dto/create-restaurant.dto'
import { RestaurantService } from './restaurant.service'

@Controller('organizations/:orgId/restaurants')
export class RestaurantController {
	constructor(private readonly restaurantService: RestaurantService) {}

	@Auth()
	@Get()
	async getRestaurants(
		@Param('orgId') orgId: string,
		@CurrentUser('idUser') userId: string
	) {
		return this.restaurantService.getByOrganization(orgId, userId)
	}

	@Auth()
	@Get(':id')
	async getRestaurant(
		@Param('orgId') orgId: string,
		@Param('id') id: string,
		@CurrentUser('idUser') userId: string
	) {
		return this.restaurantService.getById(orgId, id, userId)
	}

	@UsePipes(new ValidationPipe())
	@Auth()
	@Post()
	async createRestaurant(
		@Param('orgId') orgId: string,
		@CurrentUser('idUser') userId: string,
		@Body() dto: CreateRestaurantDto
	) {
		return this.restaurantService.create(orgId, userId, dto)
	}
}
