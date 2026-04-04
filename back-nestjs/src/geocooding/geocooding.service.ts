import { Injectable, BadRequestException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

interface ArcGISGeoResponse {
  spatialReference: { wkid: number };
  candidates: Array<{
    location: { x: number; y: number };
    address: string;
    score: number;
  }>;
}

export interface GeoResult {
  lat: number;
  lon: number;
  displayName: string;
  score: number;
}

@Injectable()
export class GeocoodingService {
  private readonly apiKey: string;
  private readonly baseUrl =
    "https://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates";

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>("ARC_GIS_API_KEY")!;
  }

  async geocodeOSM(query: string): Promise<GeoResult> {
    const url = `${this.baseUrl}?singleLine=${encodeURIComponent(query)}&f=json&token=${this.apiKey}&maxLocations=1`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new BadRequestException("Ошибка при запросе к ArcGIS геокодеру");
    }

    const data: ArcGISGeoResponse = await response.json();

    if (!data.candidates || data.candidates.length === 0) {
      throw new BadRequestException("Адрес не найден");
    }

    const candidate = data.candidates[0];

    return {
      lat: candidate.location.y,
      lon: candidate.location.x,
      displayName: candidate.address,
      score: candidate.score,
    };
  }
}
