'use client'

import { MiniLoader } from '@/components/ui/MiniLoader'
import { Modal } from '@/components/ui/Modal'
import { OWNER_PAGES } from '@/config/pages/owner.config'
import organizationService from '@/services/organization.service'
import restaurantService from '@/services/restaurant.service'
import { IOrganization, IOrganizationUpdate } from '@/types/organization.types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

export default function OrganizationPage() {
	const { id } = useParams()
	const router = useRouter()
	const queryClient = useQueryClient()
	const orgId = id as string

	const [isEditingOrg, setIsEditingOrg] = useState(false)
	const [confirmDeleteOrg, setConfirmDeleteOrg] = useState(false)

	const deleteOrg = useMutation({
		mutationFn: () => organizationService.remove(orgId),
		onSuccess: () => {
			toast.success('Organization deleted')
			router.push(OWNER_PAGES.HOME)
		},
		onError: () => toast.error('Failed to delete organization')
	})

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

	const org = orgData?.data as IOrganization | undefined
	if (!org) return null

	const restaurants = restData?.data || []

	const formatTime = (iso: string) => {
		if (!iso) return '—'
		const d = new Date(iso)
		return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
	}

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
					<div>
						<h1 className="text-3xl font-bold">{org.name}</h1>
						<div className="flex gap-3 mt-2">
							<button
								onClick={() => setIsEditingOrg(true)}
								className="text-sm text-zinc-400 hover:text-primary transition"
							>
								✏ Edit
							</button>
							{confirmDeleteOrg ? (
								<div className="flex gap-2">
									<button
										onClick={() => deleteOrg.mutate()}
										disabled={deleteOrg.isPending}
										className="text-sm text-red-500 hover:underline disabled:opacity-50"
									>
										Confirm
									</button>
									<button
										onClick={() => setConfirmDeleteOrg(false)}
										className="text-sm text-zinc-500 hover:underline"
									>
										Cancel
									</button>
								</div>
							) : (
								<button
									onClick={() => setConfirmDeleteOrg(true)}
									className="text-sm text-red-500 hover:underline"
								>
									🗑 Delete
								</button>
							)}
						</div>
					</div>
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
									onClick={() => router.push(OWNER_PAGES.RESTAURANT_MENU(orgId, rest.idRestaurant))}
									className="grid grid-cols-4 gap-4 py-4 cursor-pointer hover:text-primary transition-colors"
								>
									<span className="font-medium">{rest.name}</span>
									<span className="text-zinc-400">{rest.cuisine || '—'}</span>
									<span className="text-zinc-400">
										{formatTime(rest.timeOpened)} – {formatTime(rest.timeClosed)}
									</span>
									<span className="text-zinc-400">—</span>
								</div>
							))}
						</div>
					</div>
				)}
			</div>

			{/* Organization Edit Modal */}
			<Modal isOpen={isEditingOrg} onClose={() => setIsEditingOrg(false)}>
				<OrgEditForm
					org={org}
					onCancel={() => setIsEditingOrg(false)}
					onSuccess={() => {
						setIsEditingOrg(false)
						queryClient.invalidateQueries({ queryKey: ['organization', orgId] })
					}}
				/>
			</Modal>
		</div>
	)
}

/* ── Organization Edit Form ── */
function OrgEditForm({ org, onCancel, onSuccess }: {
	org: IOrganization
	onCancel: () => void
	onSuccess: () => void
}) {
	const { register, handleSubmit, formState: { errors } } = useForm<IOrganizationUpdate>({
		defaultValues: { name: org.name, email: org.email, phone: org.phone || '' }
	})

	const { mutate, isPending } = useMutation({
		mutationFn: (data: IOrganizationUpdate) => organizationService.update(org.idOrganization, data),
		onSuccess: () => { toast.success('Organization updated'); onSuccess() },
		onError: (err: any) => toast.error(err.response?.data?.message?.[0] || 'Failed to update')
	})

	return (
		<div>
			<h2 className="text-lg font-bold mb-4">Edit Organization</h2>
			<form onSubmit={handleSubmit((data) => mutate(data))} className="space-y-3">
				<div>
					<label className="block text-xs text-zinc-400 mb-1">Name *</label>
					<input
						{...register('name', { required: 'Name is required' })}
						className="w-full px-3 py-2 border border-zinc-700 rounded-md bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
					/>
					{errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
				</div>
				<div>
					<label className="block text-xs text-zinc-400 mb-1">Email *</label>
					<input
						{...register('email', { required: 'Email is required' })}
						type="email"
						className="w-full px-3 py-2 border border-zinc-700 rounded-md bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
					/>
					{errors.email && <span className="text-red-500 text-xs">{errors.email.message}</span>}
				</div>
				<div>
					<label className="block text-xs text-zinc-400 mb-1">Phone</label>
					<input
						{...register('phone')}
						className="w-full px-3 py-2 border border-zinc-700 rounded-md bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
					/>
				</div>
				<div className="flex gap-3 pt-2">
					<button
						type="submit"
						disabled={isPending}
						className="flex-1 bg-primary text-white py-2 rounded-md text-sm disabled:opacity-50"
					>
						{isPending ? <MiniLoader width={16} height={16} /> : 'Save'}
					</button>
					<button
						type="button"
						onClick={onCancel}
						className="bg-zinc-700 text-white px-4 py-2 rounded-md text-sm"
					>
						Cancel
					</button>
				</div>
			</form>
		</div>
	)
}
