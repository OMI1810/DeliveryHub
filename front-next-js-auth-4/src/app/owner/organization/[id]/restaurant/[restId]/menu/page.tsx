'use client'

import { MiniLoader } from '@/components/ui/MiniLoader'
import { Modal } from '@/components/ui/Modal'
import { OWNER_PAGES } from '@/config/pages/owner.config'
import productService from '@/services/product.service'
import restaurantService from '@/services/restaurant.service'
import { IProduct, IProductUpdate } from '@/types/product.types'
import { IRestaurantUpdate } from '@/types/restaurant.types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

export default function RestaurantMenuPage() {
	const { id: orgId, restId } = useParams()
	const router = useRouter()
	const queryClient = useQueryClient()
	const orgIdStr = orgId as string
	const restIdStr = restId as string

	const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null)
	const [isEditing, setIsEditing] = useState(false)
	const [isEditingRest, setIsEditingRest] = useState(false)
	const [confirmDeleteRest, setConfirmDeleteRest] = useState(false)

	const deleteRestaurant = useMutation({
		mutationFn: () => restaurantService.remove(orgIdStr, restIdStr),
		onSuccess: () => {
			toast.success('Restaurant deleted')
			router.push(OWNER_PAGES.ORGANIZATION(orgIdStr))
		},
		onError: () => toast.error('Failed to delete restaurant')
	})

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
						<div className="flex gap-3 mt-2">
							<button
								onClick={() => setIsEditingRest(true)}
								className="text-sm text-zinc-400 hover:text-primary transition"
							>
								✏ Edit
							</button>
							{confirmDeleteRest ? (
								<div className="flex gap-2">
									<button
										onClick={() => deleteRestaurant.mutate()}
										disabled={deleteRestaurant.isPending}
										className="text-sm text-red-500 hover:underline disabled:opacity-50"
									>
										Confirm
									</button>
									<button
										onClick={() => setConfirmDeleteRest(false)}
										className="text-sm text-zinc-500 hover:underline"
									>
										Cancel
									</button>
								</div>
							) : (
								<button
									onClick={() => setConfirmDeleteRest(true)}
									className="text-sm text-red-500 hover:underline"
								>
									🗑 Delete
								</button>
							)}
						</div>
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
						<div className="grid grid-cols-4 gap-4 py-3 border-b border-zinc-700 text-sm text-zinc-400 uppercase tracking-wider">
							<span>Name</span>
							<span>Price</span>
							<span>Calories</span>
							<span>Cooking time</span>
						</div>

						<div className="divide-y divide-zinc-800">
							{products.map(product => (
								<div
									key={product.idProduct}
									onClick={() => { setSelectedProduct(product); setIsEditing(false) }}
									className="grid grid-cols-4 gap-4 py-4 cursor-pointer hover:text-primary transition-colors"
								>
									<span className="font-medium">{product.name}</span>
									<span className="text-zinc-400">{product.price.toFixed(2)} ₽</span>
									<span className="text-zinc-400">{product.calories ? `${product.calories} kcal` : '—'}</span>
									<span className="text-zinc-400">{product.timeCooking ? `${product.timeCooking} min` : '—'}</span>
								</div>
							))}
						</div>
					</div>
				)}
			</div>

			{/* Product Detail / Edit Modal */}
			<Modal isOpen={!!selectedProduct} onClose={() => { setSelectedProduct(null); setIsEditing(false) }}>
				{selectedProduct && (
					isEditing
						? <ProductEditForm
							product={selectedProduct}
							orgId={orgIdStr}
							restId={restIdStr}
							onCancel={() => setIsEditing(false)}
							onSuccess={() => {
								setSelectedProduct(null)
								setIsEditing(false)
								queryClient.invalidateQueries({ queryKey: ['products', orgIdStr, restIdStr] })
							}}
						/>
						: <ProductDetail
							product={selectedProduct}
							onEdit={() => setIsEditing(true)}
							onDelete={() => {
								setSelectedProduct(null)
								setIsEditing(false)
								queryClient.invalidateQueries({ queryKey: ['products', orgIdStr, restIdStr] })
							}}
							orgId={orgIdStr}
							restId={restIdStr}
						/>
				)}
			</Modal>

			{/* Restaurant Edit Modal */}
			<Modal isOpen={isEditingRest} onClose={() => setIsEditingRest(false)}>
				<RestEditForm
					rest={restaurant}
					orgId={orgIdStr}
					restId={restIdStr}
					onCancel={() => setIsEditingRest(false)}
					onSuccess={() => {
						setIsEditingRest(false)
						queryClient.invalidateQueries({ queryKey: ['restaurant', restIdStr] })
					}}
				/>
			</Modal>
		</div>
	)
}

/* ── Product Detail View ── */
function ProductDetail({ product, onEdit, onDelete, orgId, restId }: {
	product: IProduct
	onEdit: () => void
	onDelete: () => void
	orgId: string
	restId: string
}) {
	const [confirmDelete, setConfirmDelete] = useState(false)

	const { mutate, isPending } = useMutation({
		mutationFn: () => productService.remove(orgId, restId, product.idProduct),
		onSuccess: () => {
			toast.success('Dish deleted')
			onDelete()
		}
	})

	return (
		<div>
			<h2 className="text-xl font-bold mb-4">{product.name}</h2>

			<div className="space-y-3 mb-6">
				<div>
					<span className="text-sm text-zinc-500 uppercase font-semibold">Price</span>
					<p className="text-lg">{product.price.toFixed(2)} ₽</p>
				</div>

				{product.description && (
					<div>
						<span className="text-sm text-zinc-500 uppercase font-semibold">Description</span>
						<p className="text-sm mt-1">{product.description}</p>
					</div>
				)}

				<div className="grid grid-cols-2 gap-4">
					<div>
						<span className="text-sm text-zinc-500 uppercase font-semibold">Calories</span>
						<p className="text-sm mt-1">{product.calories ? `${product.calories} kcal` : '—'}</p>
					</div>
					<div>
						<span className="text-sm text-zinc-500 uppercase font-semibold">Cooking time</span>
						<p className="text-sm mt-1">{product.timeCooking ? `${product.timeCooking} min` : '—'}</p>
					</div>
				</div>
			</div>

			<div className="flex gap-3">
				<button
					onClick={onEdit}
					className="flex-1 bg-primary text-white py-2 rounded-md hover:bg-primary/90 transition text-sm"
				>
					Edit
				</button>

				{confirmDelete ? (
					<div className="flex gap-2">
						<button
							onClick={() => mutate()}
							disabled={isPending}
							className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition text-sm disabled:opacity-50"
						>
							Confirm
						</button>
						<button
							onClick={() => setConfirmDelete(false)}
							className="bg-zinc-700 text-white px-4 py-2 rounded-md hover:bg-zinc-600 transition text-sm"
						>
							Cancel
						</button>
					</div>
				) : (
					<button
						onClick={() => setConfirmDelete(true)}
						className="bg-red-600/20 text-red-400 border border-red-600/50 px-4 py-2 rounded-md hover:bg-red-600/30 transition text-sm"
					>
						Delete
					</button>
				)}
			</div>
		</div>
	)
}

/* ── Product Edit Form ── */
function ProductEditForm({ product, orgId, restId, onCancel, onSuccess }: {
	product: IProduct
	orgId: string
	restId: string
	onCancel: () => void
	onSuccess: () => void
}) {
	const { register, handleSubmit, formState: { errors } } = useForm<IProductUpdate>({
		defaultValues: {
			name: product.name,
			price: product.price,
			description: product.description || '',
			calories: product.calories,
			timeCooking: product.timeCooking
		}
	})

	const { mutate, isPending } = useMutation({
		mutationFn: (data: IProductUpdate) => productService.update(orgId, restId, product.idProduct, data),
		onSuccess: () => {
			toast.success('Dish updated')
			onSuccess()
		},
		onError: (error: any) => {
			const message = error.response?.data?.message || 'Failed to update dish'
			toast.error(typeof message === 'string' ? message : message[0])
		}
	})

	const onSubmit = (data: IProductUpdate) => {
		const dto: IProductUpdate = {
			name: data.name?.trim(),
			price: data.price !== undefined ? parseFloat(data.price.toFixed(2)) : undefined,
			description: data.description?.trim() || undefined,
			calories: data.calories,
			timeCooking: data.timeCooking
		}
		mutate(dto)
	}

	return (
		<div>
			<h2 className="text-xl font-bold mb-4">Edit Dish</h2>

			<form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
				<div>
					<label className="block text-xs font-medium mb-1 text-zinc-400">Name *</label>
					<input
						{...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Min 2 characters' } })}
						type="text"
						className="w-full px-3 py-2 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-zinc-800 text-sm"
					/>
					{errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
				</div>

				<div>
					<label className="block text-xs font-medium mb-1 text-zinc-400">Price (₽) *</label>
					<input
						{...register('price', { required: 'Price is required', min: { value: 0.01, message: 'Must be > 0' }, valueAsNumber: true })}
						type="number"
						step="0.01"
						min="0"
						className="w-full px-3 py-2 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-zinc-800 text-sm"
					/>
					{errors.price && <span className="text-red-500 text-xs">{errors.price.message}</span>}
				</div>

				<div>
					<label className="block text-xs font-medium mb-1 text-zinc-400">Description</label>
					<textarea
						{...register('description')}
						className="w-full px-3 py-2 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-zinc-800 text-sm"
						rows={2}
					/>
				</div>

				<div className="grid grid-cols-2 gap-3">
					<div>
						<label className="block text-xs font-medium mb-1 text-zinc-400">Calories</label>
						<input
							{...register('calories', { valueAsNumber: true, validate: (v) => v === undefined || v >= 0 || 'Cannot be negative' })}
							type="number"
							step="1"
							min="0"
							className="w-full px-3 py-2 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-zinc-800 text-sm"
						/>
						{errors.calories && <span className="text-red-500 text-xs">{errors.calories.message}</span>}
					</div>

					<div>
						<label className="block text-xs font-medium mb-1 text-zinc-400">Cooking time (min)</label>
						<input
							{...register('timeCooking', { valueAsNumber: true, validate: (v) => v === undefined || (Number.isInteger(v) && v >= 0) || 'Must be positive integer' })}
							type="number"
							step="1"
							min="0"
							className="w-full px-3 py-2 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-zinc-800 text-sm"
						/>
						{errors.timeCooking && <span className="text-red-500 text-xs">{errors.timeCooking.message}</span>}
					</div>
				</div>

				<div className="flex gap-3 pt-2">
					<button
						type="submit"
						disabled={isPending}
						className="flex-1 bg-primary text-white py-2 rounded-md hover:bg-primary/90 transition text-sm disabled:opacity-50"
					>
						{isPending ? <MiniLoader width={16} height={16} /> : 'Save'}
					</button>
					<button
						type="button"
						onClick={onCancel}
						className="bg-zinc-700 text-white px-4 py-2 rounded-md hover:bg-zinc-600 transition text-sm"
					>
						Cancel
					</button>
				</div>
			</form>
		</div>
	)
}

/* ── Restaurant Edit Form ── */
function RestEditForm({ rest, orgId, restId, onCancel, onSuccess }: {
	rest: any
	orgId: string
	restId: string
	onCancel: () => void
	onSuccess: () => void
}) {
	const { register, handleSubmit, formState: { errors } } = useForm<IRestaurantUpdate>({
		defaultValues: {
			name: rest.name,
			cuisine: rest.cuisine || '',
			timeOpened: new Date(rest.timeOpened).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
			timeClosed: new Date(rest.timeClosed).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
		}
	})

	const { mutate, isPending } = useMutation({
		mutationFn: (data: IRestaurantUpdate) => restaurantService.update(orgId, restId, data),
		onSuccess: () => { toast.success('Restaurant updated'); onSuccess() },
		onError: (err: any) => toast.error(err.response?.data?.message?.[0] || 'Failed to update')
	})

	return (
		<div>
			<h2 className="text-lg font-bold mb-4">Edit Restaurant</h2>
			<form onSubmit={handleSubmit((data) => mutate(data))} className="space-y-3">
				<div>
					<label className="block text-xs text-zinc-400 mb-1">Name *</label>
					<input
						{...register('name', { required: 'Required', minLength: { value: 2, message: 'Min 2 chars' } })}
						className="w-full px-3 py-2 border border-zinc-700 rounded-md bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
					/>
					{errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
				</div>
				<div>
					<label className="block text-xs text-zinc-400 mb-1">Cuisine</label>
					<input
						{...register('cuisine')}
						className="w-full px-3 py-2 border border-zinc-700 rounded-md bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
					/>
				</div>
				<div className="grid grid-cols-2 gap-3">
					<div>
						<label className="block text-xs text-zinc-400 mb-1">Open (HH:MM)</label>
						<input
							{...register('timeOpened', { required: 'Required' })}
							className="w-full px-3 py-2 border border-zinc-700 rounded-md bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
						/>
					</div>
					<div>
						<label className="block text-xs text-zinc-400 mb-1">Close (HH:MM)</label>
						<input
							{...register('timeClosed', { required: 'Required' })}
							className="w-full px-3 py-2 border border-zinc-700 rounded-md bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
						/>
					</div>
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
