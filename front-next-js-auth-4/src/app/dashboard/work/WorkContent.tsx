'use client'

import { useProfile } from '@/hooks/useProfile'
import { UserRole } from '@/types/auth.types'
import { OrderDiscovery } from '../profile/OrderDiscovery'
import { ShiftToggle } from '../profile/ShiftToggle'

export function WorkContent() {
	const { isLoading, user } = useProfile()

	const hasDeliverymanRole =
		user?.isDeliveryman ||
		user?.role === UserRole.DELIVERYMAN ||
		(Array.isArray(user?.role) &&
			user.role.some((item: unknown) => {
				if (typeof item === 'string') {
					return item === UserRole.DELIVERYMAN
				}

				if (item && typeof item === 'object' && 'role' in item) {
					return (item as { role?: string }).role === UserRole.DELIVERYMAN
				}

				return false
			})) ||
		typeof user?.role === 'undefined'

	if (isLoading) {
		return <p>Loading...</p>
	}

	if (!hasDeliverymanRole) {
		return <p>This page is available only for delivery users.</p>
	}

	return (
		<div className="w-full max-w-2xl mt-8">
			<h2 className="text-2xl font-bold mb-2">Work</h2>
			<ShiftToggle />
			<OrderDiscovery />
		</div>
	)
}
