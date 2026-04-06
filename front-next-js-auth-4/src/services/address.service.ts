import { instance } from "@/api/axios";
import {
  IAddress,
  IAddressUser,
  ICreateAddressDto,
  IUpdateAddressDto,
} from "@/types/address.types";

class AddressService {
  private _BASE_URL = "/users/addresses";

  async getAll() {
    return instance.get<IAddressUser[]>(this._BASE_URL);
  }

  async getById(id: string) {
    return instance.get<IAddress>(`${this._BASE_URL}/${id}`);
  }

  async create(dto: ICreateAddressDto) {
    return instance.post<IAddress>(this._BASE_URL, dto);
  }

  async update(id: string, dto: IUpdateAddressDto) {
    return instance.patch<IAddress>(`${this._BASE_URL}/${id}`, dto);
  }

  async remove(id: string) {
    return instance.delete(`${this._BASE_URL}/${id}`);
  }
}

export default new AddressService();
