import { UserRole, type TProtectUserData } from '@/types/auth.types'

export type TUserDataState = {
	idUser: string
	role: UserRole
	isLoggedIn: boolean
	isGod: boolean
	isModerator: boolean
	isOwner: boolean
	isDeliveryman: boolean
}

export const transformUserToState = (
	user: TProtectUserData
): TUserDataState | null => {
	return {
		...user,
		isLoggedIn: true,
		isGod: user.role === UserRole.GOD,
		isModerator: user.role === UserRole.MODERATOR,
		isOwner: user.role === UserRole.OWNER,
		isDeliveryman: user.role === UserRole.DELIVERYMAN
	}
}
