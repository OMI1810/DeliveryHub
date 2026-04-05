import { IUser } from './user.types'

// Почему ENUM именно так (7:16) - https://www.youtube.com/watch?v=XdhhCIIksPw
export const AuthToken = {
	ACCESS_TOKEN: 'accessToken',
	REFRESH_TOKEN: 'refreshToken'
} as const

export type AuthToken = (typeof AuthToken)[keyof typeof AuthToken]

export const UserRole = {
	GOD: 'GOD',
	MODERATOR: 'MODERATOR',
	CLIENT: 'CLIENT',
	OWNER: 'OWNER',
	DELIVERYMAN: 'DELIVERYMAN',
	CASHIER: 'CASHIER'
} as const

export type UserRole = (typeof UserRole)[keyof typeof UserRole]

export interface ITokenInside {
	idUser: string
	role: UserRole | UserRole[]
	iat: number
	exp: number
}

export type TProtectUserData = Omit<ITokenInside, 'iat' | 'exp'>

export interface IFormData extends Pick<IUser, 'email'> {
	password: string
	surname?: string
	name?: string
	patronymic?: string
	phone?: string
}
