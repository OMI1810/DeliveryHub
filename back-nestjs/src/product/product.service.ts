import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { Role } from '@prisma/client'
import { PrismaService } from 'src/prisma.service'
import { CreateProductDto } from './dto/create-product.dto'
import { UpdateProductDto } from './dto/update-product.dto'

@Injectable()
export class ProductService {
	constructor(private prisma: PrismaService) {}

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

	async getByRestaurant(orgId: string, restId: string, userId: string) {
		await this.verifyAccess(orgId, restId, userId)

		return this.prisma.product.findMany({
			where: { restaurantId: restId },
			orderBy: { name: 'asc' }
		})
	}

	async getById(orgId: string, restId: string, productId: string, userId: string) {
		await this.verifyAccess(orgId, restId, userId)

		const product = await this.prisma.product.findUnique({
			where: { idProduct: productId, restaurantId: restId }
		})

		if (!product) throw new NotFoundException('Product not found')

		return product
	}

	async create(orgId: string, restId: string, userId: string, dto: CreateProductDto) {
		await this.verifyAccess(orgId, restId, userId)

		return this.prisma.product.create({
			data: {
				name: dto.name,
				price: dto.price,
				description: dto.description,
				calories: dto.calories,
				timeCooking: dto.timeCooking,
				restaurantId: restId
			}
		})
	}

	async update(orgId: string, restId: string, productId: string, userId: string, dto: UpdateProductDto) {
		await this.verifyAccess(orgId, restId, userId)
		await this.getById(orgId, restId, productId, userId)

		return this.prisma.product.update({
			where: { idProduct: productId },
			data: dto
		})
	}

	async remove(orgId: string, restId: string, productId: string, userId: string) {
		await this.verifyAccess(orgId, restId, userId)
		await this.getById(orgId, restId, productId, userId)

		return this.prisma.product.delete({
			where: { idProduct: productId }
		})
	}
}
