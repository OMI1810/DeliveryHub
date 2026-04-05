import { UserRole } from './auth.types'

export interface IUser {
	idUser: string
	surname?: string
	name?: string
	patronymic?: string
	email: string
	phone?: string
	avatarPath?: string
	verificationToken?: string
	otpCode?: string
	otpExpiresAt?: Date
	role: UserRole
}
