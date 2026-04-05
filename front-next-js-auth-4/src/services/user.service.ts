import { instance } from "@/api/axios";
import { IUser } from "@/types/user.types";

export interface IBecomeDeliverymanResult {
  message: string;
  roles: string[];
}

class UserService {
  private _BASE_URL = "/users";

  async fetchProfile() {
    return instance.get<IUser>(`${this._BASE_URL}/profile`);
  }

  async fetchPremium() {
    return instance.get<{ text: string }>(`${this._BASE_URL}/premium`);
  }

  async fetchManagerContent() {
    return instance.get<{ text: string }>(`${this._BASE_URL}/manager`);
  }

  async fetchList() {
    return instance.get<IUser[]>(`${this._BASE_URL}/list`);
  }

  async updateUserEmail(email: string) {
    return instance.patch(`${this._BASE_URL}/update-email`, { email });
  }

  async becomeDeliveryman() {
    return instance.post<IBecomeDeliverymanResult>(
      `${this._BASE_URL}/become-deliveryman`,
    );
  }
}

export default new UserService();
