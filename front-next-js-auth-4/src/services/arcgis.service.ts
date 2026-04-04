import { axiosClassic } from "@/api/axios";
import { IAddressSuggestion, IGeoResult } from "@/types/arcgis.types";

class ArcgisService {
  private _BASE_URL = "/geocooding";

  async getSuggestions(query: string) {
    return axiosClassic.get<IAddressSuggestion[]>(`${this._BASE_URL}/suggest`, {
      params: { q: query },
    });
  }

  async findByMagicKey(magicKey: string) {
    return axiosClassic.get<IGeoResult>(`${this._BASE_URL}/find`, {
      params: { magicKey },
    });
  }

  async geocode(address: string) {
    return axiosClassic.get<IGeoResult>(this._BASE_URL, {
      params: { address },
    });
  }

  async reverseGeocode(lat: number, lon: number) {
    return axiosClassic.get<IGeoResult>(`${this._BASE_URL}/reverse`, {
      params: { lat, lon },
    });
  }
}

export default new ArcgisService();
