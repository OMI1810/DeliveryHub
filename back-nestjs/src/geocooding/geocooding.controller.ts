import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { GeocoodingService, GeoResult } from "./geocooding.service";

@Controller("geocooding")
export class GeocoodingController {
  constructor(private readonly geocoodingService: GeocoodingService) {}

  @Get()
  async GetCoord(
    @Query()
    dto: {
      street: string;
      city: string;
      country: string;
      postalcode?: string;
    },
  ): Promise<GeoResult> {
    const query: string = `${dto.country}, ${dto.city}, ${dto.street}`;

    return this.geocoodingService.geocodeOSM(query);
  }
}
