import { GeocoodingModule } from "@/geocooding/geocooding.module";
import { PrismaService } from "@/prisma.service";
import { Module } from "@nestjs/common";
import { AddressController } from "./address.controller";
import { AddressService } from "./address.service";

@Module({
  imports: [GeocoodingModule],
  controllers: [AddressController],
  providers: [AddressService, PrismaService],
  exports: [AddressService],
})
export class AddressModule {}
