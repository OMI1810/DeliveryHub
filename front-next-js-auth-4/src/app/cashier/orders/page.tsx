'use client'

import { MiniLoader } from '@/components/ui/MiniLoader'
import cashierService from '@/services/cashier.service'
import { ICashierOrder } from '@/types/cashier.types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

const STATUS_LABELS: Record<string, string> = {
	CREATED: 'Новый',
	COOKING: 'Готовится',
	FROM_DELIVERYMAN: 'У курьера',
	DELIVERED: 'Доставлен'
}

const STATUS_COLORS: Record<string, string> = {
	CREATED: 'bg-yellow-600/20 text-yellow-400',
	COOKING: 'bg-blue-600/20 text-blue-400',
	FROM_DELIVERYMAN: 'bg-purple-600/20 text-purple-400',
	DELIVERED: 'bg-green-600/20 text-green-400'
}

const STATUS_FLOW: Record<string, { next: string; label: string }> = {
	CREATED: { next: 'COOKING', label: 'Принять' },
	COOKING: { next: 'FROM_DELIVERYMAN', label: 'Готов' },
	FROM_DELIVERYMAN: { next: 'DELIVERED', label: 'Завершить' },
	DELIVERED: { next: '', label: '' }
}

export default function CashierOrdersPage() {
	const router = useRouter()
	const queryClient = useQueryClient()

	const { data, isLoading } = useQuery({
		queryKey: ['cashier-orders'],
		queryFn: () => cashierService.getOrders(),
		refetchInterval: 10000
	})

	const updateStatus = useMutation({
		mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
			cashierService.updateOrderStatus(orderId, status),
		onSuccess: () => {
			toast.success('Статус обновлён')
			queryClient.invalidateQueries({ queryKey: ['cashier-orders'] })
		}
	})

	if (isLoading) {
		return (
			<div className="flex justify-center mt-10">
				<MiniLoader width={50} height={50} />
			</div>
		)
	}

	const orders: ICashierOrder[] = data?.data || []

	return (
		<div className="p-8 max-w-4xl mx-auto">
			<h1 className="text-3xl font-bold mb-6">Заказы</h1>

			{orders.length === 0 ? (
				<div className="text-center py-10 border border-dashed border-zinc-700 rounded-lg">
					<p className="text-zinc-400">Нет заказов</p>
				</div>
			) : (
				<div className="space-y-4">
					{orders.map(order => (
						<OrderCard key={order.idOrder} order={order} updateStatus={updateStatus} />
					))}
				</div>
			)}
		</div>
	)
}

function OrderCard({ order, updateStatus }: {
	order: ICashierOrder
	updateStatus: any
}) {
	const flow = STATUS_FLOW[order.status]

	return (
		<div className="border border-zinc-800 rounded-lg p-4">
			<div className="flex justify-between items-start mb-3">
				<div>
					<p className="font-semibold">Заказ #{order.idOrder.slice(-6)}</p>
					<p className="text-xs text-zinc-500 mt-1">
						{new Date(order.createAt).toLocaleString('ru-RU')}
					</p>
				</div>
				<span className={`px-2 py-1 rounded text-xs font-medium ${STATUS_COLORS[order.status] || ''}`}>
					{STATUS_LABELS[order.status] || order.status}
				</span>
			</div>

			<div className="text-sm mb-3">
				<p className="text-zinc-400">
					📍 {order.address?.address || '—'}
				</p>
				<p className="text-zinc-400">
					👤 {order.client?.surname} {order.client?.name}
					{order.client?.phone ? ` • ${order.client.phone}` : ''}
				</p>
			</div>

			<div className="border-t border-zinc-800 pt-2 mb-3">
				{order.products.map(p => (
					<div key={p.idOrderProduct} className="text-sm text-zinc-300">
						{p.product.name} × {p.quantity} — {(p.price * p.quantity).toFixed(2)} ₽
					</div>
				))}
			</div>

			<div className="flex justify-between items-center">
				<p className="font-semibold">
					Итого: {order.products.reduce((s, p) => s + p.price * p.quantity, 0).toFixed(2)} ₽
				</p>

				{flow?.next && order.status !== 'DELIVERED' && (
					<button
						onClick={() => updateStatus.mutate({ orderId: order.idOrder, status: flow.next })}
						disabled={updateStatus.isPending}
						className="bg-primary text-white px-4 py-2 rounded-md text-sm hover:bg-primary/90 disabled:opacity-50 transition"
					>
						{flow.label}
					</button>
				)}
			</div>
		</div>
	)
}
