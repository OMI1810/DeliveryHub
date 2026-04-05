import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { Role } from '@prisma/client'
import { PrismaService } from 'src/prisma.service'
import { CreateOrganizationDto } from './dto/create-organization.dto'
import { UpdateOrganizationDto } from './dto/update-organization.dto'

@Injectable()
export class OrganizationService {
	constructor(private prisma: PrismaService) { }

	async getInit(ownerId: string) {
		const organizations = await this.prisma.organization.findMany({
			where: { ownerId }
		})
		return { organizations }
	}

	async getById(idOrganization: string, userId: string) {
		const organization = await this.prisma.organization.findUnique({
			where: { idOrganization }
		})

		if (!organization) {
			throw new BadRequestException('Organization not found')
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

		return organization
	}

	async create(userId: string, dto: CreateOrganizationDto) {
		// Check uniqueness manually for better error messages
		const existingByName = await this.prisma.organization.findUnique({
			where: { name: dto.name }
		})
		if (existingByName) throw new BadRequestException('Organization name already exists')

		const existingByEmail = await this.prisma.organization.findUnique({
			where: { email: dto.email }
		})
		if (existingByEmail) throw new BadRequestException('Organization email already exists')

		// Create organization
		const organization = await this.prisma.organization.create({
			data: {
				name: dto.name,
				email: dto.email,
				phone: dto.phone,
				ownerId: userId
			}
		})

		// Check if user has OWNER role
		const ownerRoleExists = await this.prisma.userRole.findUnique({
			where: {
				userId_role: {
					userId,
					role: Role.OWNER
				}
			}
		})

		if (!ownerRoleExists) {
			await this.prisma.userRole.create({
				data: {
					userId,
					role: Role.OWNER
				}
			})
		}

		return organization
	}

	async update(userId: string, idOrganization: string, dto: UpdateOrganizationDto) {
		const existing = await this.getById(idOrganization, userId)

		if (dto.name && dto.name !== existing.name) {
			const byName = await this.prisma.organization.findUnique({ where: { name: dto.name } })
			if (byName) throw new BadRequestException('Organization name already exists')
		}
		if (dto.email && dto.email !== existing.email) {
			const byEmail = await this.prisma.organization.findUnique({ where: { email: dto.email } })
			if (byEmail) throw new BadRequestException('Organization email already exists')
		}

		return this.prisma.organization.update({
			where: { idOrganization },
			data: dto
		})
	}

	async remove(userId: string, idOrganization: string) {
		await this.getById(idOrganization, userId)

		return this.prisma.organization.delete({
			where: { idOrganization }
		})
	}
}
