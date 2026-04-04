'use client'

import { MiniLoader } from '@/components/ui/MiniLoader'
import { OWNER_PAGES } from '@/config/pages/owner.config'
import productService from '@/services/product.service'
import restaurantService from '@/services/restaurant.service'
import { IProduct } from '@/types/product.types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

export default function RestaurantMenuPage() {
	const { id: orgId, restId } = useParams()
	const router = useRouter()
	const queryClient = useQueryClient()
	const orgIdStr = orgId as string
	const restIdStr = restId as string

	const { data: restData, isLoading: restLoading, isError: restError } = useQuery({
		queryKey: ['restaurant', restIdStr],
		queryFn: () => restaurantService.getById(orgIdStr, restIdStr),
		enabled: !!orgIdStr && !!restIdStr
	})

	const { data: productsData, isLoading: productsLoading } = useQuery({
		queryKey: ['products', orgIdStr, restIdStr],
		queryFn: () => productService.getAll(orgIdStr, restIdStr),
		enabled: !!orgIdStr && !!restIdStr
	})

	useEffect(() => {
		if (restError) {
			toast.error('Restaurant not found')
			router.push(OWNER_PAGES.ORGANIZATION(orgIdStr))
		}
	}, [restError, router, orgIdStr])

	if (restLoading || productsLoading) {
		return (
			<div className="flex justify-center mt-10">
				<MiniLoader width={50} height={50} />
			</div>
		)
	}

	const restaurant = restData?.data
	if (!restaurant) return null

	const products = productsData?.data || []

	return (
		<div className="p-8 max-w-4xl mx-auto">
			<Link
				href={OWNER_PAGES.ORGANIZATION(orgIdStr)}
				className="inline-block text-zinc-400 hover:text-primary mb-6 transition-colors"
			>
				← Back to organization
			</Link>

			<div className="mb-8">
				<div className="flex justify-between items-start mb-6">
					<div>
						<h1 className="text-3xl font-bold">{restaurant.name}</h1>
						<p className="text-zinc-400 mt-1">{restaurant.cuisine || 'No cuisine specified'}</p>
					</div>
					<Link
						href={OWNER_PAGES.PRODUCT_CREATE(orgIdStr, restIdStr)}
						className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition text-sm"
					>
						Add dish
					</Link>
				</div>

				<div className="grid grid-cols-2 gap-4 text-sm">
					<div className="border-b border-zinc-800 pb-2">
						<span className="text-zinc-500 uppercase">Hours</span>
						<p className="mt-1">
							{new Date(restaurant.timeOpened).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
							{' — '}
							{new Date(restaurant.timeClosed).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
						</p>
					</div>
				</div>
			</div>

			<div>
				<h2 className="text-xl font-semibold mb-4">Menu ({products.length})</h2>

				{products.length === 0 ? (
					<div className="text-center py-10 border border-dashed border-zinc-700 rounded-lg">
						<h2 className="text-xl font-medium text-zinc-400 mb-2">
							No dishes yet
						</h2>
						<p className="text-zinc-500">Add your first dish to the menu</p>
					</div>
				) : (
					<div>
						<div className="grid grid-cols-5 gap-4 py-3 border-b border-zinc-700 text-sm text-zinc-400 uppercase tracking-wider">
							<span className="col-span-2">Name</span>
							<span>Price</span>
							<span>Calories</span>
							<span>Cooking time</span>
						</div>

						<div className="divide-y divide-zinc-800">
							{products.map(product => (
								<ProductRow
									key={product.idProduct}
									product={product}
									orgId={orgIdStr}
									restId={restIdStr}
									onDelete={() => queryClient.invalidateQueries({ queryKey: ['products', orgIdStr, restIdStr] })}
								/>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	)
}

function ProductRow({ product, orgId, restId, onDelete }: {
	product: IProduct
	orgId: string
	restId: string
	onDelete: () => void
}) {
	const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

	const { mutate, isPending } = useMutation({
		mutationFn: () => productService.remove(orgId, restId, product.idProduct),
		onSuccess: () => {
			toast.success('Dish deleted')
			onDelete()
			setConfirmDelete(null)
		}
	})

	return (
		<div className="grid grid-cols-5 gap-4 py-4 hover:text-primary transition-colors">
			<div className="col-span-2">
				<p className="font-medium">{product.name}</p>
				{product.description && (
					<p className="text-sm text-zinc-500 truncate">{product.description}</p>
				)}
			</div>
			<span className="text-zinc-400">{product.price.toFixed(2)} ₽</span>
			<span className="text-zinc-400">{product.calories ? `${product.calories} kcal` : '—'}</span>
			<div className="flex items-center justify-between">
				<span className="text-zinc-400">{product.timeCooking ? `${product.timeCooking} min` : '—'}</span>
				{confirmDelete === product.idProduct ? (
					<div className="flex gap-2">
						<button
							onClick={() => mutate()}
							disabled={isPending}
							className="text-red-500 text-xs hover:underline disabled:opacity-50"
						>
							Confirm
						</button>
						<button
							onClick={() => setConfirmDelete(null)}
							className="text-zinc-500 text-xs hover:underline"
						>
							Cancel
						</button>
					</div>
				) : (
					<button
						onClick={() => setConfirmDelete(product.idProduct)}
						className="text-red-500 text-xs hover:underline"
					>
						Delete
					</button>
				)}
			</div>
		</div>
	)
}
