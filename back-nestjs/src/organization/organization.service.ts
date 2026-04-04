import {
	BadRequestException,
	ForbiddenException,
	Injectable
} from '@nestjs/common'
import { Role } from '@prisma/client'
import { PrismaService } from 'src/prisma.service'
import { CreateOrganizationDto } from './dto/create-organization.dto'

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
}
