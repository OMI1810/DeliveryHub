'use client'

import { MiniLoader } from '@/components/ui/MiniLoader'
import { Modal } from '@/components/ui/Modal'
import { OWNER_PAGES } from '@/config/pages/owner.config'
import cashierService from '@/services/cashier.service'
import restaurantService from '@/services/restaurant.service'
import { ICashier } from '@/types/cashier.types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

export default function RestaurantStaffPage() {
	const { id: orgId, restId } = useParams()
	const router = useRouter()
	const queryClient = useQueryClient()
	const orgIdStr = orgId as string
	const restIdStr = restId as string

	const [showAddModal, setShowAddModal] = useState(false)
	const [addSuccess, setAddSuccess] = useState<ICashier | null>(null)

	const removeCashier = useMutation({
		mutationFn: (cashierId: string) => cashierService.remove(orgIdStr, restIdStr, cashierId),
		onSuccess: () => { toast.success('Cashier removed'); queryClient.invalidateQueries({ queryKey: ['cashiers', orgIdStr, restIdStr] }) }
	})

	const { data: restData, isLoading: restLoading, isError: restError } = useQuery({
		queryKey: ['restaurant', restIdStr],
		queryFn: () => restaurantService.getById(orgIdStr, restIdStr),
		enabled: !!orgIdStr && !!restIdStr
	})

	const { data: cashiersData, isLoading: cashiersLoading } = useQuery({
		queryKey: ['cashiers', orgIdStr, restIdStr],
		queryFn: () => cashierService.getCashiers(orgIdStr, restIdStr),
		enabled: !!orgIdStr && !!restIdStr
	})

	useEffect(() => {
		if (restError) { toast.error('Restaurant not found'); router.push(OWNER_PAGES.ORGANIZATION(orgIdStr)) }
	}, [restError, router, orgIdStr])

	if (restLoading || cashiersLoading) return <div className="flex justify-center py-16"><MiniLoader /></div>

	const restaurant = restData?.data
	if (!restaurant) return null

	const cashiers: ICashier[] = cashiersData?.data || []

	return (
		<div className="space-y-4">
			<Link href={OWNER_PAGES.RESTAURANT_MENU(orgIdStr, restIdStr)} className="inline-block text-zinc-400 text-sm">← Back to restaurant</Link>

			<div className="flex justify-between items-start">
				<div>
					<h1 className="text-xl font-bold">Staff — {restaurant.name}</h1>
					<p className="text-xs text-zinc-400 mt-0.5">Manage cashiers</p>
				</div>
				<button onClick={() => setShowAddModal(true)} className="bg-emerald-600 text-white px-3 py-2 rounded-xl text-xs font-medium active:bg-emerald-700">+ Add</button>
			</div>

			{cashiers.length === 0 ? (
				<div className="text-center py-12 border border-dashed border-zinc-700 rounded-xl">
					<p className="text-zinc-400 text-sm mb-1">No cashiers yet</p>
					<p className="text-zinc-600 text-xs">Add a cashier by email</p>
				</div>
			) : (
				<div className="space-y-2">
					{cashiers.map(cashier => (
						<div key={cashier.idUser} className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4 flex items-center justify-between">
							<div>
								<p className="font-medium text-sm">{cashier.surname} {cashier.name}</p>
								<p className="text-xs text-zinc-400">{cashier.email}</p>
							</div>
							<button onClick={() => { if (confirm(`Remove ${cashier.email}?`)) removeCashier.mutate(cashier.idUser) }} className="text-rose-400 text-xs active:text-rose-300">Remove</button>
						</div>
					))}
				</div>
			)}

			<Modal isOpen={showAddModal} onClose={() => { setShowAddModal(false); setAddSuccess(null) }}>
				{addSuccess ? (
					<div className="text-center py-4">
						<div className="text-emerald-400 text-3xl mb-3">✓</div>
						<h2 className="text-lg font-bold mb-2">Cashier added</h2>
						<p className="text-sm text-zinc-400 mb-1">{addSuccess.email}</p>
						<p className="text-xs text-zinc-500 mb-4">has been added as a cashier</p>
						<button onClick={() => { setShowAddModal(false); setAddSuccess(null) }} className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium">Done</button>
					</div>
				) : (
					<AddCashierForm orgId={orgIdStr} restId={restIdStr} onCancel={() => setShowAddModal(false)} onSuccess={(cashier) => { setAddSuccess(cashier); queryClient.invalidateQueries({ queryKey: ['cashiers', orgIdStr, restIdStr] }) }} />
				)}
			</Modal>
		</div>
	)
}

/* ── Add Cashier Form ── */
function AddCashierForm({ orgId, restId, onCancel, onSuccess }: { orgId: string; restId: string; onCancel: () => void; onSuccess: (cashier: ICashier) => void }) {
	const [email, setEmail] = useState('')
	const [emailError, setEmailError] = useState('')

	const { mutate, isPending } = useMutation({
		mutationFn: () => cashierService.assignByEmail(orgId, restId, email),
		onSuccess: (res) => onSuccess(res.data),
		onError: (err: any) => { const msg = err.response?.data?.message; setEmailError(typeof msg === 'string' ? msg : (msg?.[0] || 'Failed')) }
	})

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		if (!email.trim()) return
		setEmailError('')
		mutate()
	}

	return (
		<div>
			<h2 className="text-lg font-bold mb-4">Add Cashier</h2>
			<form onSubmit={handleSubmit} className="space-y-3">
				<div>
					<label className="block text-xs text-zinc-400 mb-1">Email</label>
					<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border border-zinc-700 rounded-xl bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50" placeholder="cashier@example.com" autoFocus />
					{emailError && <p className="text-rose-400 text-xs mt-1">{emailError}</p>}
				</div>
				<div className="flex gap-3 pt-2">
					<button type="submit" disabled={isPending || !email.trim()} className="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl text-sm disabled:opacity-50">{isPending ? <MiniLoader /> : 'Next'}</button>
					<button type="button" onClick={onCancel} className="bg-zinc-700 text-white px-4 py-2.5 rounded-xl text-sm">Cancel</button>
				</div>
			</form>
		</div>
	)
}
