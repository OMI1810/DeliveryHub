import { Module } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { CashierController } from './cashier.controller'
import { CashierService } from './cashier.service'

@Module({
	controllers: [CashierController],
	providers: [PrismaService, CashierService]
})
export class CashierModule {}
