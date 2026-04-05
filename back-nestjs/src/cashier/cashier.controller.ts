import { Auth } from '@/auth/decorators/auth.decorator'
import { CurrentUser } from '@/auth/decorators/user.decorator'
import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	Post,
	UsePipes,
	ValidationPipe
} from '@nestjs/common'
import { AssignCashierDto } from './dto/assign-cashier.dto'
import { CreateCashierDto } from './dto/create-cashier.dto'
import { CashierService } from './cashier.service'

@Controller('organizations/:orgId/restaurants/:restId/cashiers')
export class CashierController {
	constructor(private readonly cashierService: CashierService) { }

	@Auth()
	@Get()
	async getCashiers(
		@Param('orgId') orgId: string,
		@Param('restId') restId: string,
		@CurrentUser('idUser') userId: string
	) {
		return this.cashierService.getCashiers(orgId, restId, userId)
	}

	@UsePipes(new ValidationPipe())
	@Auth()
	@Post()
	@HttpCode(201)
	async createCashier(
		@Param('orgId') orgId: string,
		@Param('restId') restId: string,
		@CurrentUser('idUser') userId: string,
		@Body() dto: CreateCashierDto
	) {
		return this.cashierService.create(orgId, restId, userId, dto)
	}

	@UsePipes(new ValidationPipe())
	@Auth()
	@Post('assign')
	@HttpCode(200)
	async assignCashierByEmail(
		@Param('orgId') orgId: string,
		@Param('restId') restId: string,
		@CurrentUser('idUser') userId: string,
		@Body() dto: AssignCashierDto
	) {
		return this.cashierService.assignByEmail(orgId, restId, userId, dto.email)
	}

	@HttpCode(200)
	@Auth()
	@Delete(':cashierId')
	async removeCashier(
		@Param('orgId') orgId: string,
		@Param('restId') restId: string,
		@Param('cashierId') cashierId: string,
		@CurrentUser('idUser') userId: string
	) {
		return this.cashierService.remove(orgId, restId, cashierId, userId)
	}
}
