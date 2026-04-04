'use client'

import { MiniLoader } from '@/components/ui/MiniLoader'
import { OWNER_PAGES } from '@/config/pages/owner.config'
import organizationService from '@/services/organization.service'
import restaurantService from '@/services/restaurant.service'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import toast from 'react-hot-toast'

export default function OrganizationPage() {
	const { id } = useParams()
	const router = useRouter()
	const orgId = id as string

	const { data: orgData, isLoading: orgLoading, isError: orgError } = useQuery({
		queryKey: ['organization', orgId],
		queryFn: () => organizationService.fetchById(orgId),
		retry: false,
		enabled: !!orgId
	})

	const { data: restData, isLoading: restLoading } = useQuery({
		queryKey: ['restaurants', orgId],
		queryFn: () => restaurantService.getAll(orgId),
		enabled: !!orgId
	})

	useEffect(() => {
		if (orgError) {
			toast.error('You do not have access to this organization or it does not exist')
			router.push(OWNER_PAGES.HOME)
		}
	}, [orgError, router])

	if (orgLoading || restLoading) {
		return (
			<div className="flex justify-center mt-10">
				<MiniLoader width={50} height={50} />
			</div>
		)
	}

	const org = orgData?.data
	if (!org) return null

	const restaurants = restData?.data || []

	return (
		<div className="p-8 max-w-4xl mx-auto">
			<Link
				href={OWNER_PAGES.HOME}
				className="inline-block text-zinc-400 hover:text-primary mb-6 transition-colors"
			>
				← Back to organizations
			</Link>

			<div className="mb-8">
				<div className="flex justify-between items-start mb-6">
					<h1 className="text-3xl font-bold">{org.name}</h1>
					<Link
						href={OWNER_PAGES.RESTAURANT_CREATE(orgId)}
						className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition text-sm"
					>
						Create restaurant
					</Link>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div className="border-b border-zinc-800 pb-4">
						<span className="text-sm text-zinc-500 uppercase font-semibold tracking-wider">Email</span>
						<p className="text-lg mt-1">{org.email}</p>
					</div>

					<div className="border-b border-zinc-800 pb-4">
						<span className="text-sm text-zinc-500 uppercase font-semibold tracking-wider">Phone</span>
						<p className="text-lg mt-1">{org.phone || 'Not provided'}</p>
					</div>
				</div>
			</div>

			<div>
				<h2 className="text-xl font-semibold mb-4">Restaurants</h2>

				{restaurants.length === 0 ? (
					<div className="text-center py-10 border border-dashed border-zinc-700 rounded-lg">
						<h2 className="text-xl font-medium text-zinc-400 mb-2">
							No restaurants yet
						</h2>
						<p className="text-zinc-500">Create your first restaurant to get started</p>
					</div>
				) : (
					<div>
						<div className="grid grid-cols-4 gap-4 py-3 border-b border-zinc-700 text-sm text-zinc-400 uppercase tracking-wider">
							<span>Name</span>
							<span>Cuisine</span>
							<span>Hours</span>
							<span>Orders</span>
						</div>

						<div className="divide-y divide-zinc-800">
							{restaurants.map(rest => (
								<div
									key={rest.idRestaurant}
									className="grid grid-cols-4 gap-4 py-4 cursor-pointer hover:text-primary transition-colors"
								>
									<span className="font-medium">{rest.name}</span>
									<span className="text-zinc-400">{rest.cuisine || '—'}</span>
									<span className="text-zinc-400">
										{rest.timeOpened.slice(0, 5)} – {rest.timeClosed.slice(0, 5)}
									</span>
									<span className="text-zinc-400">—</span>
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</div >
	)
}
