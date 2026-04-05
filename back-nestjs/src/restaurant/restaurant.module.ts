import { Module } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { PublicRestaurantController } from './public-restaurant.controller'
import { RestaurantController } from './restaurant.controller'
import { RestaurantService } from './restaurant.service'

@Module({
	controllers: [RestaurantController, PublicRestaurantController],
	providers: [PrismaService, RestaurantService]
})
export class RestaurantModule { }
