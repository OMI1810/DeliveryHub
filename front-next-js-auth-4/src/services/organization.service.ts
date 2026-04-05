import { instance } from '@/api/axios'
import {
	IOrganization,
	IOrganizationCreate,
	IOrganizationResponse,
	IOrganizationUpdate
} from '@/types/organization.types'

class OrganizationService {
	private _BASE_URL = '/organizations'
	private _OWNER_URL = '/owner/init'

	async fetchOwnerInit() {
		return instance.get<IOrganizationResponse>(this._OWNER_URL)
	}

	async create(data: IOrganizationCreate) {
		return instance.post<IOrganization>(this._BASE_URL, data)
	}

	async fetchById(id: string) {
		return instance.get<IOrganization>(`${this._BASE_URL}/${id}`)
	}

	async update(id: string, data: IOrganizationUpdate) {
		return instance.patch<IOrganization>(`${this._BASE_URL}/${id}`, data)
	}

	async remove(id: string) {
		return instance.delete(`${this._BASE_URL}/${id}`)
	}
}

export default new OrganizationService()
