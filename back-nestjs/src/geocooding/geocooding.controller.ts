import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import {
  GeocoodingService,
  GeoResult,
  AddressSuggestion,
} from "./geocooding.service";

@Controller("geocooding")
export class GeocoodingController {
  constructor(private readonly geocoodingService: GeocoodingService) {}

  @Get()
  async GetCoord(
    @Query()
    dto: {
      address: string;
    },
  ): Promise<GeoResult> {
    return this.geocoodingService.geocodeOSM(dto.address);
  }

  @Get("suggest")
  async getSuggestions(
    @Query("q") query: string,
  ): Promise<AddressSuggestion[]> {
    if (!query || query.length < 3) return [];
    return this.geocoodingService.suggest(query);
  }

  @Get("find")
  async findByMagicKey(
    @Query("magicKey") magicKey: string,
  ): Promise<GeoResult> {
    return this.geocoodingService.findByMagicKey(magicKey);
  }

  @Get("reverse")
  async reverseGeocode(
    @Query("lat") lat: number,
    @Query("lon") lon: number,
  ): Promise<GeoResult> {
    return this.geocoodingService.reverseGeocode(lat, lon);
  }
}
