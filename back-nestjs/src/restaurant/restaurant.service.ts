import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { Role } from '@prisma/client'
import { PrismaService } from 'src/prisma.service'
import { CreateRestaurantDto } from './dto/create-restaurant.dto'
import { UpdateRestaurantDto } from './dto/update-restaurant.dto'

@Injectable()
export class RestaurantService {
	constructor(private prisma: PrismaService) { }

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
			},
			orderBy: { name: 'asc' }
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

		// Validate time format
		const timeValidation = this.validateTime(dto.timeOpened, dto.timeClosed)
		if (!timeValidation.valid) {
			throw new BadRequestException(timeValidation.error)
		}

		// Resolve coordinates
		const lat = dto.lat ?? 0
		const lon = dto.lon ?? 0

		// Create restaurant with address in a transaction
		return this.prisma.$transaction(async (tx) => {
			// Create Address
			const address = await tx.address.create({
				data: {
					address: dto.address,
					floor: dto.floor || null,
					comment: dto.comment || null,
					cordinatY: lat,
					cordinatX: lon
				}
			})

			// Create Restaurant
			const restaurant = await tx.restaurant.create({
				data: {
					name: dto.name,
					description: dto.description || null,
					cuisine: dto.cuisine || null,
					timeOpened: timeValidation.timeOpened,
					timeClosed: timeValidation.timeClosed,
					organizationId: orgId,
					address: {
						create: {
							addressId: address.idAddress
						}
					}
				},
				include: {
					address: {
						include: {
							address: true
						}
					}
				}
			})

			return restaurant
		})
	}

	private validateTime(opened: string, closed: string) {
		const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/

		if (!timeRegex.test(opened)) {
			return { valid: false, error: 'Invalid opening time format. Use HH:MM (00:00 — 23:59)' }
		}
		if (!timeRegex.test(closed)) {
			return { valid: false, error: 'Invalid closing time format. Use HH:MM (00:00 — 23:59)' }
		}

		const [openH, openM] = opened.split(':').map(Number)
		const [closeH, closeM] = closed.split(':').map(Number)

		// Create DateTime objects (using today's date)
		const timeOpened = new Date()
		timeOpened.setHours(openH, openM, 0, 0)

		const timeClosed = new Date()
		timeClosed.setHours(closeH, closeM, 0, 0)

		return { valid: true, timeOpened, timeClosed }
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

	async update(orgId: string, restId: string, userId: string, dto: UpdateRestaurantDto) {
		await this.verifyOrganizationAccess(orgId, userId)

		const updateData: Record<string, unknown> = {
			name: dto.name,
			cuisine: dto.cuisine
		}

		// Parse time strings to Date objects for @db.Time(0)
		if (dto.timeOpened) {
			const [h, m] = dto.timeOpened.split(':').map(Number)
			if (isNaN(h) || isNaN(m)) throw new BadRequestException('Invalid timeOpened format')
			const d = new Date()
			d.setHours(h, m, 0, 0)
			updateData.timeOpened = d
		}

		if (dto.timeClosed) {
			const [h, m] = dto.timeClosed.split(':').map(Number)
			if (isNaN(h) || isNaN(m)) throw new BadRequestException('Invalid timeClosed format')
			const d = new Date()
			d.setHours(h, m, 0, 0)
			updateData.timeClosed = d
		}

		return this.prisma.restaurant.update({
			where: { idRestaurant: restId },
			data: updateData
		})
	}

	async remove(orgId: string, restId: string, userId: string) {
		await this.verifyOrganizationAccess(orgId, userId)

		return this.prisma.restaurant.delete({
			where: { idRestaurant: restId }
		})
	}
}
