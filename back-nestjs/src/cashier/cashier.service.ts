import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { Role } from '@prisma/client'
import { hash } from 'argon2'
import { PrismaService } from 'src/prisma.service'
import { CreateCashierDto } from './dto/create-cashier.dto'

@Injectable()
export class CashierService {
	constructor(private prisma: PrismaService) { }

	async getCashiers(orgId: string, restId: string, userId: string) {
		await this.verifyAccess(orgId, restId, userId)

		return this.prisma.user.findMany({
			where: {
				cashierRestaurantId: restId,
				role: { some: { role: Role.CASHIER } }
			},
			select: {
				idUser: true,
				email: true,
				name: true,
				surname: true
			}
		})
	}

	async create(orgId: string, restId: string, userId: string, dto: CreateCashierDto) {
		await this.verifyAccess(orgId, restId, userId)

		// Check email uniqueness
		const existing = await this.prisma.user.findUnique({
			where: { email: dto.email }
		})
		if (existing) throw new BadRequestException('Email already exists')

		// Create user with CASHIER role and linked to restaurant
		return this.prisma.user.create({
			data: {
				email: dto.email,
				name: dto.name,
				password: await hash(dto.password),
				cashierRestaurantId: restId,
				role: {
					create: { role: Role.CASHIER }
				}
			},
			select: {
				idUser: true,
				email: true,
				name: true,
				cashierRestaurantId: true
			}
		})
	}

	async remove(orgId: string, restId: string, cashierId: string, userId: string) {
		await this.verifyAccess(orgId, restId, userId)

		const cashier = await this.prisma.user.findUnique({
			where: { idUser: cashierId }
		})

		if (!cashier || cashier.cashierRestaurantId !== restId) {
			throw new NotFoundException('Cashier not found')
		}

		return this.prisma.user.delete({
			where: { idUser: cashierId }
		})
	}

	async assignByEmail(orgId: string, restId: string, ownerUserId: string, email: string) {
		await this.verifyAccess(orgId, restId, ownerUserId)

		const user = await this.prisma.user.findUnique({
			where: { email },
			include: { role: true }
		})

		if (!user) {
			throw new NotFoundException('User not found')
		}

		if (user.verificationToken) {
			throw new BadRequestException('User must verify their email first')
		}

		if (user.cashierRestaurantId && user.cashierRestaurantId !== restId) {
			throw new BadRequestException('User is already a cashier at another restaurant')
		}

		// Check if already a cashier at this restaurant
		if (user.cashierRestaurantId === restId) {
			const isCashier = user.role.some(r => r.role === Role.CASHIER)
			if (isCashier) {
				throw new BadRequestException('User is already a cashier at this restaurant')
			}
		}

		// Add CASHIER role if not present
		const isCashier = user.role.some(r => r.role === Role.CASHIER)
		if (!isCashier) {
			await this.prisma.userRole.create({
				data: { userId: user.idUser, role: Role.CASHIER }
			})
		}

		// Link to restaurant
		return this.prisma.user.update({
			where: { idUser: user.idUser },
			data: { cashierRestaurantId: restId },
			select: {
				idUser: true,
				email: true,
				name: true,
				surname: true,
				cashierRestaurantId: true
			}
		})
	}

	private async verifyAccess(orgId: string, restId: string, userId: string) {
		const org = await this.prisma.organization.findUnique({
			where: { idOrganization: orgId }
		})
		if (!org) throw new NotFoundException('Organization not found')

		const userRoles = await this.prisma.userRole.findMany({ where: { userId } })
		const roles = userRoles.map(r => r.role)

		if (
			org.ownerId !== userId &&
			!roles.includes(Role.GOD) &&
			!roles.includes(Role.MODERATOR)
		) {
			throw new ForbiddenException('No access to this organization')
		}

		const restaurant = await this.prisma.restaurant.findUnique({
			where: { idRestaurant: restId, organizationId: orgId }
		})
		if (!restaurant) throw new NotFoundException('Restaurant not found')
	}
}
