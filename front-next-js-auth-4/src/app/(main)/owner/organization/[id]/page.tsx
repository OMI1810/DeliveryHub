'use client'

import { MiniLoader } from '@/components/ui/MiniLoader'
import { Modal } from '@/components/ui/Modal'
import { PhoneInput } from '@/components/ui/PhoneInput'
import { OWNER_PAGES } from '@/config/pages/owner.config'
import organizationService from '@/services/organization.service'
import restaurantService from '@/services/restaurant.service'
import { IOrganization, IOrganizationUpdate } from '@/types/organization.types'
import { cleanPhone, validatePhone } from '@/utils/phone'
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
		onSuccess: () => { toast.success('Organization deleted'); router.push(OWNER_PAGES.HOME) },
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
			toast.error('No access to this organization')
			router.push(OWNER_PAGES.HOME)
		}
	}, [orgError, router])

	if (orgLoading || restLoading) {
		return <div className="flex justify-center py-16"><MiniLoader /></div>
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
		<div className="space-y-6">
			<Link href={OWNER_PAGES.HOME} className="inline-block text-zinc-400 text-sm">← К организациям</Link>

			{/* Header */}
			<div className="flex justify-between items-start">
				<div>
					<h1 className="text-xl font-bold">{org.name}</h1>
					<div className="flex gap-3 mt-2">
						<button onClick={() => setIsEditingOrg(true)} className="text-xs text-zinc-400 active:text-emerald-500">✏ Edit</button>
						{confirmDeleteOrg ? (
							<div className="flex gap-2">
								<button onClick={() => deleteOrg.mutate()} disabled={deleteOrg.isPending} className="text-xs text-rose-500 disabled:opacity-50">Confirm</button>
								<button onClick={() => setConfirmDeleteOrg(false)} className="text-xs text-zinc-500">Cancel</button>
							</div>
						) : (
							<button onClick={() => setConfirmDeleteOrg(true)} className="text-xs text-rose-500">🗑 Delete</button>
						)}
					</div>
				</div>
				<Link href={OWNER_PAGES.RESTAURANT_CREATE(orgId)} className="bg-emerald-600 text-white px-3 py-2 rounded-xl text-xs font-medium active:bg-emerald-700">+ Restaurant</Link>
			</div>

			{/* Info */}
			<div className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4 space-y-3">
				<div>
					<p className="text-xs text-zinc-400">Email</p>
					<p className="text-sm">{org.email}</p>
				</div>
				<div>
					<p className="text-xs text-zinc-400">Phone</p>
					<p className="text-sm">{org.phone || 'Not provided'}</p>
				</div>
			</div>

			{/* Restaurants */}
			<div>
				<h2 className="text-lg font-semibold mb-3">Restaurants</h2>

				{restaurants.length === 0 ? (
					<div className="text-center py-12 border border-dashed border-zinc-700 rounded-xl">
						<p className="text-zinc-400 text-sm mb-1">No restaurants yet</p>
						<p className="text-zinc-600 text-xs">Create your first restaurant</p>
					</div>
				) : (
					<div className="space-y-2">
						{restaurants.map(rest => (
							<div
								key={rest.idRestaurant}
								onClick={() => router.push(OWNER_PAGES.RESTAURANT_MENU(orgId, rest.idRestaurant))}
								className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4 cursor-pointer active:bg-zinc-800 transition-colors"
							>
								<p className="font-medium text-sm">{rest.name}</p>
								<div className="flex items-center gap-3 mt-1 text-xs text-zinc-400">
									{rest.cuisine && <span>{rest.cuisine}</span>}
									<span>{formatTime(rest.timeOpened)} – {formatTime(rest.timeClosed)}</span>
								</div>
							</div>
						))}
					</div>
				)}
			</div>

			{/* Org Edit Modal */}
			<Modal isOpen={isEditingOrg} onClose={() => setIsEditingOrg(false)}>
				<OrgEditForm
					org={org}
					onCancel={() => setIsEditingOrg(false)}
					onSuccess={() => { setIsEditingOrg(false); queryClient.invalidateQueries({ queryKey: ['organization', orgId] }) }}
				/>
			</Modal>
		</div>
	)
}

/* ── Organization Edit Form ── */
function OrgEditForm({ org, onCancel, onSuccess }: { org: IOrganization; onCancel: () => void; onSuccess: () => void }) {
	const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<IOrganizationUpdate>({
		defaultValues: { name: org.name, email: org.email, phone: org.phone || '' }
	})

	register('phone', {
		validate: (value) => { if (!value) return true; if (!validatePhone(value)) return 'Invalid phone format'; return true }
	})

	const { mutate, isPending } = useMutation({
		mutationFn: (data: IOrganizationUpdate) => {
			const cleaned = data.phone ? cleanPhone(data.phone) : undefined
			return organizationService.update(org.idOrganization, { ...data, phone: cleaned })
		},
		onSuccess: () => { toast.success('Organization updated'); onSuccess() },
		onError: (err: any) => toast.error(err.response?.data?.message?.[0] || 'Failed to update')
	})

	return (
		<div>
			<h2 className="text-lg font-bold mb-4">Edit Organization</h2>
			<form onSubmit={handleSubmit((data) => mutate(data))} className="space-y-3">
				<div>
					<label className="block text-xs text-zinc-400 mb-1">Name *</label>
					<input {...register('name', { required: 'Name is required' })} className="w-full px-3 py-2 border border-zinc-700 rounded-xl bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
					{errors.name && <span className="text-rose-400 text-xs">{errors.name.message}</span>}
				</div>
				<div>
					<label className="block text-xs text-zinc-400 mb-1">Email *</label>
					<input {...register('email', { required: 'Email is required' })} type="email" className="w-full px-3 py-2 border border-zinc-700 rounded-xl bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
					{errors.email && <span className="text-rose-400 text-xs">{errors.email.message}</span>}
				</div>
				<div>
					<label className="block text-xs text-zinc-400 mb-1">Phone</label>
					<PhoneInput value={watch('phone') || ''} onChange={(value) => setValue('phone', value)} error={!!errors.phone} />
					{errors.phone && <span className="text-rose-400 text-xs">{errors.phone.message}</span>}
				</div>
				<div className="flex gap-3 pt-2">
					<button type="submit" disabled={isPending} className="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl text-sm disabled:opacity-50">{isPending ? <MiniLoader /> : 'Save'}</button>
					<button type="button" onClick={onCancel} className="bg-zinc-700 text-white px-4 py-2.5 rounded-xl text-sm">Cancel</button>
				</div>
			</form>
		</div>
	)
}
