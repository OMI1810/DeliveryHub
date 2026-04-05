'use server'

import { ITokenInside, type TProtectUserData } from '@/types/auth.types'
import { transformUserToState } from '@/utils/transform-user-to-state'
import * as jose from 'jose'

export async function jwtVerifyServer(accessToken: string) {
	try {
		const { payload }: { payload: ITokenInside } = await jose.jwtVerify(
			accessToken,
			new TextEncoder().encode(`${process.env.JWT_SECRET}`)
		)

		if (!payload) return null

		// Map JWT payload { id, roles } → TProtectUserData { idUser, role }
		const userData: TProtectUserData = {
			idUser: payload.id,
			role: payload.roles
		}

		return transformUserToState(userData)
	} catch (error) {
		if (
			error instanceof Error &&
			error.message.includes('exp claim timestamp check failed')
		) {
			console.log('Токен истек')
			return null
		}

		console.log('Ошибка при верификации токена: ', error)
		return null
	}
}
