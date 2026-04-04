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

interface ArcGISSuggestResponse {
  suggestions: Array<{
    text: string;
    magicKey: string;
    isCollection: boolean;
  }>;
}

export interface GeoResult {
  lat: number;
  lon: number;
  displayName: string;
  score: number;
}

export interface AddressSuggestion {
  text: string;
  magicKey: string;
}

@Injectable()
export class GeocoodingService {
  private readonly apiKey: string;
  private readonly baseUrl =
    "https://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer";

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>("ARC_GIS_API_KEY")!;
  }

  async suggest(query: string): Promise<AddressSuggestion[]> {
    const url = `${this.baseUrl}/suggest?f=json&text=${encodeURIComponent(query)}&maxSuggestions=5&token=${this.apiKey}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new BadRequestException("Ошибка при запросе подсказок ArcGIS");
    }

    const data: ArcGISSuggestResponse = await response.json();

    return (data.suggestions || []).map((s) => ({
      text: s.text,
      magicKey: s.magicKey,
    }));
  }

  async findByMagicKey(magicKey: string): Promise<GeoResult> {
    const url = `${this.baseUrl}/findAddressCandidates?f=json&magicKey=${encodeURIComponent(magicKey)}&maxLocations=1&token=${this.apiKey}`;

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

  async reverseGeocode(lat: number, lon: number): Promise<GeoResult> {
    const url = `${this.baseUrl}/reverseGeocode?location=${lon},${lat}&f=json&token=${this.apiKey}&outFields=City,Region,Postal,Address,CountryCode,Match_addr,LongLabel,ShortLabel`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new BadRequestException(
        "Ошибка при обратном геокодировании ArcGIS",
      );
    }

    const data = await response.json();

    const addressData = data.address || {};

    const parts: string[] = [];
    if (addressData.City) parts.push(addressData.City);
    if (addressData.Address) parts.push(addressData.Address);

    const displayName =
      parts.join(", ") ||
      addressData.LongLabel ||
      addressData.Match_addr ||
      `${addressData.City || ""}, ${addressData.Region || ""}`.trim() ||
      `${lat.toFixed(6)}, ${lon.toFixed(6)}`;

    return {
      lat,
      lon,
      displayName,
      score: 100,
    };
  }

  async geocodeOSM(query: string): Promise<GeoResult> {
    const url = `${this.baseUrl}/findAddressCandidates?singleLine=${encodeURIComponent(query)}&f=json&token=${this.apiKey}&maxLocations=1`;

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
