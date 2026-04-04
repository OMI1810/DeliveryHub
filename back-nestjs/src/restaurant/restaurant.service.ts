import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { Role } from '@prisma/client'
import { PrismaService } from 'src/prisma.service'
import { CreateRestaurantDto } from './dto/create-restaurant.dto'

@Injectable()
export class RestaurantService {
	constructor(private prisma: PrismaService) {}

	async getByOrganization(orgId: string, userId: string) {
		await this.verifyOrganizationAccess(orgId, userId)

		return this.prisma.restaurant.findMany({
			where: { organizationId: orgId },
			include: {
				address: {
					include: {
						address: true
					}
				}
			}
		})
	}

	async getById(orgId: string, restId: string, userId: string) {
		await this.verifyOrganizationAccess(orgId, userId)

		const restaurant = await this.prisma.restaurant.findUnique({
			where: { idRestaurant: restId, organizationId: orgId },
			include: {
				address: {
					include: {
						address: true
					}
				}
			}
		})

		if (!restaurant) {
			throw new NotFoundException('Restaurant not found')
		}

		return restaurant
	}

	async create(orgId: string, userId: string, dto: CreateRestaurantDto) {
		await this.verifyOrganizationAccess(orgId, userId)

		// Parse time strings to DateTime (Prisma @db.Time(0) expects DateTime)
		const [hoursOpened, minutesOpened] = dto.timeOpened.split(':').map(Number)
		const [hoursClosed, minutesClosed] = dto.timeClosed.split(':').map(Number)

		if (
			isNaN(hoursOpened) || isNaN(minutesOpened) ||
			isNaN(hoursClosed) || isNaN(minutesClosed)
		) {
			throw new BadRequestException('Invalid time format. Use HH:MM')
		}

		// Create base DateTime values (date part is irrelevant for @db.Time)
		const timeOpened = new Date()
		timeOpened.setHours(hoursOpened, minutesOpened, 0, 0)

		const timeClosed = new Date()
		timeClosed.setHours(hoursClosed, minutesClosed, 0, 0)

		return this.prisma.restaurant.create({
			data: {
				name: dto.name,
				description: dto.description,
				cuisine: dto.cuisine,
				timeOpened,
				timeClosed,
				organizationId: orgId
			}
		})
	}

	private async verifyOrganizationAccess(orgId: string, userId: string) {
		const organization = await this.prisma.organization.findUnique({
			where: { idOrganization: orgId }
		})

		if (!organization) {
			throw new NotFoundException('Organization not found')
		}

		const userRolesRecord = await this.prisma.userRole.findMany({
			where: { userId }
		})
		const userRoles = userRolesRecord.map(r => r.role)

		if (
			organization.ownerId !== userId &&
			!userRoles.includes(Role.GOD) &&
			!userRoles.includes(Role.MODERATOR)
		) {
			throw new ForbiddenException('You do not have access to this organization')
		}
	}
}
