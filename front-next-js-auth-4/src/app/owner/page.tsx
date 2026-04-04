'use client'

import { MiniLoader } from '@/components/ui/MiniLoader'
import { OWNER_PAGES } from '@/config/pages/owner.config'
import organizationService from '@/services/organization.service'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function OwnerPage() {
	const router = useRouter()

	const { data, isLoading } = useQuery({
		queryKey: ['owner-init'],
		queryFn: () => organizationService.fetchOwnerInit()
	})

	if (isLoading) {
		return (
			<div className="flex justify-center mt-10">
				<MiniLoader width={50} height={50} />
			</div>
		)
	}

	const organizations = data?.data.organizations || []

	return (
		<div className="p-8 max-w-4xl mx-auto">
			<div className="flex justify-between items-center mb-8">
				<h1 className="text-3xl font-bold">Owner Panel</h1>
				<Link
					href={OWNER_PAGES.CREATE}
					className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition"
				>
					Create organization
				</Link>
			</div>

			{organizations.length === 0 ? (
				<div className="text-center py-10 border border-dashed border-zinc-700 rounded-lg">
					<h2 className="text-xl font-medium text-zinc-400 mb-2">
						You don't have any organizations yet
					</h2>
					<p className="text-zinc-500">Create your first organization to get started</p>
				</div>
			) : (
				<div>
					{/* Header */}
					<div className="grid grid-cols-3 gap-4 py-3 border-b border-zinc-700 text-sm text-zinc-400 uppercase tracking-wider">
						<span>Name</span>
						<span>Email</span>
						<span>Phone</span>
					</div>

					{/* Rows */}
					<div className="divide-y divide-zinc-800">
						{organizations.map(org => (
							<div
								key={org.idOrganization}
								onClick={() => router.push(OWNER_PAGES.ORGANIZATION(org.idOrganization))}
								className="grid grid-cols-3 gap-4 py-4 cursor-pointer hover:text-primary transition-colors"
							>
								<span className="font-medium">{org.name}</span>
								<span className="text-zinc-400">{org.email}</span>
								<span className="text-zinc-400">{org.phone || '—'}</span>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	)
}
