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
			<div className="flex justify-center py-16">
				<MiniLoader />
			</div>
		)
	}

	const organizations = data?.data.organizations || []

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h1 className="text-xl font-bold">Owner Panel</h1>
				<Link
					href={OWNER_PAGES.CREATE}
					className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-medium active:bg-emerald-700"
				>
					+ Создать
				</Link>
			</div>

			{organizations.length === 0 ? (
				<div className="text-center py-16">
					<div className="text-4xl mb-3">🏢</div>
					<p className="text-zinc-400 text-sm mb-1">Организаций пока нет</p>
					<p className="text-zinc-600 text-xs">Создайте первую организацию</p>
				</div>
			) : (
				<div className="space-y-2">
					{organizations.map(org => (
						<div
							key={org.idOrganization}
							onClick={() => router.push(OWNER_PAGES.ORGANIZATION(org.idOrganization))}
							className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4 cursor-pointer active:bg-zinc-800 transition-colors"
						>
							<p className="font-medium text-sm">{org.name}</p>
							<p className="text-xs text-zinc-400 mt-0.5">{org.email}</p>
							{org.phone && (
								<p className="text-xs text-zinc-500 mt-0.5">{org.phone}</p>
							)}
						</div>
					))}
				</div>
			)}
		</div>
	)
}
