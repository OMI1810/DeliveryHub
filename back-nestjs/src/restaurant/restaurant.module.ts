import { Module } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { RestaurantController } from './restaurant.controller'
import { RestaurantService } from './restaurant.service'

@Module({
	controllers: [RestaurantController],
	providers: [PrismaService, RestaurantService]
})
export class RestaurantModule {}
