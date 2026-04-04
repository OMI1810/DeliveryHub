import { instance } from '@/api/axios'

export type ShiftStatus = 'active' | 'completed'

export interface IShift {
	idShift: string
	userId: string
	startTime: string
	endTime: string | null
	status: ShiftStatus
}

export interface IShiftStateResponse {
	isOnline: boolean
	shift: IShift | null
}

class ShiftService {
	private _BASE_URL = '/users/shift'

	async fetchShiftState() {
		return instance.get<IShiftStateResponse>(this._BASE_URL)
	}

	async startShift() {
		return instance.post<IShiftStateResponse>(`${this._BASE_URL}/start`)
	}

	async stopShift() {
		return instance.post<IShiftStateResponse>(`${this._BASE_URL}/stop`)
	}
}

export default new ShiftService()
