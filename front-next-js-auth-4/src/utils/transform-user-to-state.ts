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

const hasRole = (role: UserRole | UserRole[] | undefined, target: UserRole): boolean => {
	if (!role) return false
	if (Array.isArray(role)) return role.includes(target)
	return role === target
}

export const transformUserToState = (
	user: TProtectUserData
): TUserDataState | null => {
	return {
		...user,
		role: Array.isArray(user.role) ? user.role[0] : user.role,
		isLoggedIn: true,
		isGod: hasRole(user.role, UserRole.GOD),
		isModerator: hasRole(user.role, UserRole.MODERATOR),
		isOwner: hasRole(user.role, UserRole.OWNER),
		isDeliveryman: hasRole(user.role, UserRole.DELIVERYMAN),
		isCashier: hasRole(user.role, UserRole.CASHIER)
	}
}
