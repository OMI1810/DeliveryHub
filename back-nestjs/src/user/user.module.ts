import { PrismaService } from '@/prisma.service'
import { Module } from '@nestjs/common'
import { UserController } from './user.controller'
import { UserService } from './user.service'
import { AddressModule } from './address/address.module';

@Module({
	controllers: [UserController],
	providers: [UserService, PrismaService],
	exports: [UserService],
	imports: [AddressModule]
})
export class UserModule {}
