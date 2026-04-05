import { Auth } from '@/auth/decorators/auth.decorator'
import { CurrentUser } from '@/auth/decorators/user.decorator'
import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	Patch,
	Post,
	UsePipes,
	ValidationPipe
} from '@nestjs/common'
import { CreateRestaurantDto } from './dto/create-restaurant.dto'
import { UpdateRestaurantDto } from './dto/update-restaurant.dto'
import { RestaurantService } from './restaurant.service'

@Controller('organizations/:orgId/restaurants')
export class RestaurantController {
	constructor(private readonly restaurantService: RestaurantService) { }

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

	@UsePipes(new ValidationPipe())
	@Auth()
	@Patch(':id')
	async updateRestaurant(
		@Param('orgId') orgId: string,
		@Param('id') id: string,
		@CurrentUser('idUser') userId: string,
		@Body() dto: UpdateRestaurantDto
	) {
		return this.restaurantService.update(orgId, id, userId, dto)
	}

	@HttpCode(200)
	@Auth()
	@Delete(':id')
	async removeRestaurant(
		@Param('orgId') orgId: string,
		@Param('id') id: string,
		@CurrentUser('idUser') userId: string
	) {
		return this.restaurantService.remove(orgId, id, userId)
	}

	/** Публичный список всех ресторанов (без авторизации) */
	@Get('public')
	async getPublicRestaurants() {
		return this.restaurantService.getAllPublic()
	}
}
