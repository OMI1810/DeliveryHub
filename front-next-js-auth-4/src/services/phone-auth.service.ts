import { axiosClassic } from '@/api/axios'

interface ICodeResponse {
	message: string
}

interface IVerifyCodeResponse extends ICodeResponse {
	accessToken: string
}

class PhoneAuthService {
	async sendCode(
		phone: string,
		channel: 'sms' | 'whatsapp'
	): Promise<ICodeResponse> {
		const response = await axiosClassic.post<ICodeResponse>(
			'/auth/sms/send-code',
			{
				phone,
				channel
			}
		)
		return response.data
	}

	async verifyCode(phone: string, code: string): Promise<IVerifyCodeResponse> {
		const response = await axiosClassic.post<IVerifyCodeResponse>(
			'/auth/sms/verify-code',
			{
				phone,
				code
			}
		)
		return response.data
	}
}

export default new PhoneAuthService()
