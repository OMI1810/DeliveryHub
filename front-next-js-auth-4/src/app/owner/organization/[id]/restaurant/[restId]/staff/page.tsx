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
		onSuccess: () => {
			toast.success('Cashier removed')
			queryClient.invalidateQueries({ queryKey: ['cashiers', orgIdStr, restIdStr] })
		}
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
		if (restError) {
			toast.error('Restaurant not found')
			router.push(OWNER_PAGES.ORGANIZATION(orgIdStr))
		}
	}, [restError, router, orgIdStr])

	if (restLoading || cashiersLoading) {
		return (
			<div className="flex justify-center mt-10">
				<MiniLoader width={50} height={50} />
			</div>
		)
	}

	const restaurant = restData?.data
	if (!restaurant) return null

	const cashiers: ICashier[] = cashiersData?.data || []

	return (
		<div className="p-8 max-w-3xl mx-auto">
			<Link
				href={OWNER_PAGES.RESTAURANT_MENU(orgIdStr, restIdStr)}
				className="inline-block text-zinc-400 hover:text-primary mb-6 transition-colors"
			>
				← Back to restaurant
			</Link>

			<div className="mb-8">
				<div className="flex justify-between items-start mb-4">
					<div>
						<h1 className="text-3xl font-bold">Staff — {restaurant.name}</h1>
						<p className="text-zinc-400 mt-1">Manage cashiers for this restaurant</p>
					</div>
					<button
						onClick={() => setShowAddModal(true)}
						className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition text-sm"
					>
						Add cashier
					</button>
				</div>
			</div>

			{cashiers.length === 0 ? (
				<div className="text-center py-10 border border-dashed border-zinc-700 rounded-lg">
					<h2 className="text-xl font-medium text-zinc-400 mb-2">
						No cashiers yet
					</h2>
					<p className="text-zinc-500">Add a cashier by email to get started</p>
				</div>
			) : (
				<div>
					<div className="grid grid-cols-3 gap-4 py-3 border-b border-zinc-700 text-sm text-zinc-400 uppercase tracking-wider">
						<span>Name</span>
						<span>Email</span>
						<span></span>
					</div>
					<div className="divide-y divide-zinc-800">
						{cashiers.map(cashier => (
							<div
								key={cashier.idUser}
								className="grid grid-cols-3 gap-4 py-4"
							>
								<span className="font-medium">{cashier.surname} {cashier.name}</span>
								<span className="text-zinc-400">{cashier.email}</span>
								<div className="flex justify-end">
									<button
										onClick={() => {
											if (confirm(`Remove ${cashier.email} from cashiers?`)) {
												removeCashier.mutate(cashier.idUser)
											}
										}}
										className="text-red-500 text-sm hover:underline"
									>
										Remove
									</button>
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Add Cashier Modal */}
			<Modal isOpen={showAddModal} onClose={() => { setShowAddModal(false); setAddSuccess(null) }}>
				{addSuccess ? (
					<div className="text-center py-4">
						<div className="text-green-400 text-3xl mb-3">✓</div>
						<h2 className="text-lg font-bold mb-2">Cashier request sent</h2>
						<p className="text-sm text-zinc-400 mb-1">{addSuccess.email}</p>
						<p className="text-xs text-zinc-500 mb-4">has been added as a cashier</p>
						<button
							onClick={() => { setShowAddModal(false); setAddSuccess(null) }}
							className="bg-primary text-white px-6 py-2 rounded-md text-sm"
						>
							Done
						</button>
					</div>
				) : (
					<AddCashierForm
						orgId={orgIdStr}
						restId={restIdStr}
						onCancel={() => setShowAddModal(false)}
						onSuccess={(cashier) => {
							setAddSuccess(cashier)
							queryClient.invalidateQueries({ queryKey: ['cashiers', orgIdStr, restIdStr] })
						}}
					/>
				)}
			</Modal>
		</div>
	)
}

/* ── Add Cashier Form ── */
function AddCashierForm({ orgId, restId, onCancel, onSuccess }: {
	orgId: string
	restId: string
	onCancel: () => void
	onSuccess: (cashier: ICashier) => void
}) {
	const [email, setEmail] = useState('')
	const [emailError, setEmailError] = useState('')

	const { mutate, isPending } = useMutation({
		mutationFn: () => cashierService.assignByEmail(orgId, restId, email),
		onSuccess: (res) => onSuccess(res.data),
		onError: (err: any) => {
			const msg = err.response?.data?.message
			setEmailError(typeof msg === 'string' ? msg : (msg?.[0] || 'Failed to add cashier'))
		}
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
					<input
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						className="w-full px-3 py-2 border border-zinc-700 rounded-md bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
						placeholder="cashier@example.com"
						autoFocus
					/>
					{emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
				</div>
				<div className="flex gap-3 pt-2">
					<button
						type="submit"
						disabled={isPending || !email.trim()}
						className="flex-1 bg-primary text-white py-2 rounded-md text-sm disabled:opacity-50"
					>
						{isPending ? <MiniLoader width={16} height={16} /> : 'Next'}
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
