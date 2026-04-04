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
import { Role } from '@prisma/client'
import { CreateOrganizationDto } from './dto/create-organization.dto'
import { OrganizationService } from './organization.service'

@Controller()
export class OrganizationController {
	constructor(private readonly organizationService: OrganizationService) {}

	@Auth()
	@Get('owner/init')
	async getOwnerInit(@CurrentUser('idUser') userId: string) {
		return this.organizationService.getInit(userId)
	}

	@UsePipes(new ValidationPipe())
	@Auth()
	@Post('organizations')
	async createOrganization(
		@CurrentUser('idUser') userId: string,
		@Body() dto: CreateOrganizationDto
	) {
		return this.organizationService.create(userId, dto)
	}

	@Auth()
	@Get('organizations/:id')
	async getOrganization(
		@Param('id') id: string,
		@CurrentUser('idUser') userId: string
	) {
		return this.organizationService.getById(id, userId)
	}
}
