import { Module } from "@nestjs/common";
import { GeocoodingService } from "./geocooding.service";
import { GeocoodingController } from "./geocooding.controller";

@Module({
  controllers: [GeocoodingController],
  providers: [GeocoodingService],
  exports: [GeocoodingService],
})
export class GeocoodingModule {}
