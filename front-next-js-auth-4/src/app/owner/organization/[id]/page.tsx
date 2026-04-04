'use client'

import { MiniLoader } from '@/components/ui/MiniLoader'
import { OWNER_PAGES } from '@/config/pages/owner.config'
import organizationService from '@/services/organization.service'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import toast from 'react-hot-toast'

export default function OrganizationPage() {
	const { id } = useParams()
	const router = useRouter()

	const { data, isLoading, isError } = useQuery({
		queryKey: ['organization', id],
		queryFn: () => organizationService.fetchById(id as string),
		retry: false,
		enabled: !!id
	})

	useEffect(() => {
		if (isError) {
			toast.error('You do not have access to this organization or it does not exist')
			router.push(OWNER_PAGES.HOME)
		}
	}, [isError, router])

	if (isLoading) {
		return (
			<div className="flex justify-center mt-10">
				<MiniLoader width={50} height={50} />
			</div>
		)
	}

	const org = data?.data

	if (!org) return null

	return (
		<div className="p-8 max-w-4xl mx-auto">
			<Link
				href={OWNER_PAGES.HOME}
				className="inline-block text-zinc-400 hover:text-primary mb-6 transition-colors"
			>
				← Back to organizations
			</Link>

			<div className="mb-8">
				<h1 className="text-3xl font-bold mb-6">{org.name}</h1>

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

			<div className="border border-dashed border-zinc-700 rounded-lg p-10 text-center">
				<h2 className="text-xl font-medium text-zinc-400 mb-2">
					Organization management
				</h2>
				<p className="text-zinc-500">Coming soon — restaurants, menus, orders, and more</p>
			</div>
		</div>
	)
}
