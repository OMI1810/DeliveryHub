import { UserRole, type TProtectUserData } from '@/types/auth.types'

export type TUserDataState = {
	idUser: string
	role: UserRole
	isLoggedIn: boolean
	isGod: boolean
	isModerator: boolean
	isOwner: boolean
	isDeliveryman: boolean
	isCashier: boolean
}

const hasRole = (roles: UserRole | UserRole[] | undefined, target: UserRole): boolean => {
	if (!roles) return false
	const arr = Array.isArray(roles) ? roles : [roles]
	return arr.includes(target)
}

export const transformUserToState = (
	user: TProtectUserData
): TUserDataState | null => {
	const roles = user.role
	return {
		idUser: user.idUser,
		role: Array.isArray(roles) ? roles[0] : roles,
		isLoggedIn: true,
		isGod: hasRole(roles, UserRole.GOD),
		isModerator: hasRole(roles, UserRole.MODERATOR),
		isOwner: hasRole(roles, UserRole.OWNER),
		isDeliveryman: hasRole(roles, UserRole.DELIVERYMAN),
		isCashier: hasRole(roles, UserRole.CASHIER)
	}
}
