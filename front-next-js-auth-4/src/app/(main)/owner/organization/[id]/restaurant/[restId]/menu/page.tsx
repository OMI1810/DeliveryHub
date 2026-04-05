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
		onSuccess: () => { toast.success('Restaurant deleted'); router.push(OWNER_PAGES.ORGANIZATION(orgIdStr)) },
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
		if (restError) { toast.error('Restaurant not found'); router.push(OWNER_PAGES.ORGANIZATION(orgIdStr)) }
	}, [restError, router, orgIdStr])

	if (restLoading || productsLoading) return <div className="flex justify-center py-16"><MiniLoader /></div>

	const restaurant = restData?.data
	if (!restaurant) return null

	const products = productsData?.data || []

	return (
		<div className="space-y-6">
			<Link href={OWNER_PAGES.ORGANIZATION(orgIdStr)} className="inline-block text-zinc-400 text-sm">← Back to organization</Link>

			<div className="flex justify-between items-start">
				<div>
					<h1 className="text-xl font-bold">{restaurant.name}</h1>
					<div className="flex gap-3 mt-2">
						<button onClick={() => setIsEditingRest(true)} className="text-xs text-zinc-400 active:text-emerald-500">✏ Edit</button>
						{confirmDeleteRest ? (
							<div className="flex gap-2">
								<button onClick={() => deleteRestaurant.mutate()} disabled={deleteRestaurant.isPending} className="text-xs text-rose-500 disabled:opacity-50">Confirm</button>
								<button onClick={() => setConfirmDeleteRest(false)} className="text-xs text-zinc-500">Cancel</button>
							</div>
						) : (
							<button onClick={() => setConfirmDeleteRest(true)} className="text-xs text-rose-500">🗑 Delete</button>
						)}
					</div>
					<p className="text-xs text-zinc-400 mt-1">{restaurant.cuisine || 'No cuisine specified'}</p>
				</div>
				<div className="flex gap-2">
					<Link href={OWNER_PAGES.RESTAURANT_STAFF(orgIdStr, restIdStr)} className="bg-zinc-700 text-white px-3 py-2 rounded-xl text-xs font-medium active:bg-zinc-600">👥 Staff</Link>
					<Link href={OWNER_PAGES.PRODUCT_CREATE(orgIdStr, restIdStr)} className="bg-emerald-600 text-white px-3 py-2 rounded-xl text-xs font-medium active:bg-emerald-700">+ Dish</Link>
				</div>
			</div>

			<div className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4">
				<p className="text-xs text-zinc-400">Hours</p>
				<p className="text-sm">
					{new Date(restaurant.timeOpened).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
					{' — '}
					{new Date(restaurant.timeClosed).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
				</p>
			</div>

			{/* Menu */}
			<div>
				<h2 className="text-lg font-semibold mb-3">Menu ({products.length})</h2>

				{products.length === 0 ? (
					<div className="text-center py-12 border border-dashed border-zinc-700 rounded-xl">
						<p className="text-zinc-400 text-sm mb-1">No dishes yet</p>
						<p className="text-zinc-600 text-xs">Add your first dish</p>
					</div>
				) : (
					<div className="space-y-2">
						{products.map(product => (
							<div
								key={product.idProduct}
								onClick={() => { setSelectedProduct(product); setIsEditing(false) }}
								className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4 cursor-pointer active:bg-zinc-800 transition-colors"
							>
								<div className="flex justify-between items-start">
									<p className="font-medium text-sm">{product.name}</p>
									<p className="text-sm font-bold">{product.price.toFixed(2)} ₽</p>
								</div>
								<div className="flex gap-3 mt-1 text-xs text-zinc-400">
									{product.calories && <span>{product.calories} kcal</span>}
									{product.timeCooking && <span>{product.timeCooking} min</span>}
								</div>
							</div>
						))}
					</div>
				)}
			</div>

			{/* Product Modal */}
			<Modal isOpen={!!selectedProduct} onClose={() => { setSelectedProduct(null); setIsEditing(false) }}>
				{selectedProduct && (isEditing
					? <ProductEditForm product={selectedProduct} orgId={orgIdStr} restId={restIdStr} onCancel={() => setIsEditing(false)} onSuccess={() => { setSelectedProduct(null); setIsEditing(false); queryClient.invalidateQueries({ queryKey: ['products', orgIdStr, restIdStr] }) }} />
					: <ProductDetail product={selectedProduct} onEdit={() => setIsEditing(true)} onDelete={() => { setSelectedProduct(null); setIsEditing(false); queryClient.invalidateQueries({ queryKey: ['products', orgIdStr, restIdStr] }) }} orgId={orgIdStr} restId={restIdStr} />
				)}
			</Modal>

			{/* Restaurant Edit Modal */}
			<Modal isOpen={isEditingRest} onClose={() => setIsEditingRest(false)}>
				<RestEditForm rest={restaurant} orgId={orgIdStr} restId={restIdStr} onCancel={() => setIsEditingRest(false)} onSuccess={() => { setIsEditingRest(false); queryClient.invalidateQueries({ queryKey: ['restaurant', restIdStr] }) }} />
			</Modal>
		</div>
	)
}

/* ── Product Detail ── */
function ProductDetail({ product, onEdit, onDelete, orgId, restId }: { product: IProduct; onEdit: () => void; onDelete: () => void; orgId: string; restId: string }) {
	const [confirmDelete, setConfirmDelete] = useState(false)
	const { mutate, isPending } = useMutation({
		mutationFn: () => productService.remove(orgId, restId, product.idProduct),
		onSuccess: () => { toast.success('Dish deleted'); onDelete() }
	})

	return (
		<div>
			<h2 className="text-lg font-bold mb-4">{product.name}</h2>
			<div className="space-y-3 mb-6">
				<div><p className="text-xs text-zinc-400">Price</p><p className="text-lg font-bold">{product.price.toFixed(2)} ₽</p></div>
				{product.description && <div><p className="text-xs text-zinc-400">Description</p><p className="text-sm mt-0.5">{product.description}</p></div>}
				<div className="grid grid-cols-2 gap-3">
					<div><p className="text-xs text-zinc-400">Calories</p><p className="text-sm">{product.calories ? `${product.calories} kcal` : '—'}</p></div>
					<div><p className="text-xs text-zinc-400">Cooking time</p><p className="text-sm">{product.timeCooking ? `${product.timeCooking} min` : '—'}</p></div>
				</div>
			</div>
			<div className="flex gap-3">
				<button onClick={onEdit} className="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl text-sm font-medium active:bg-emerald-700">Edit</button>
				{confirmDelete ? (
					<div className="flex gap-2">
						<button onClick={() => mutate()} disabled={isPending} className="bg-rose-600 text-white px-4 py-2.5 rounded-xl text-sm disabled:opacity-50">Confirm</button>
						<button onClick={() => setConfirmDelete(false)} className="bg-zinc-700 text-white px-4 py-2.5 rounded-xl text-sm">Cancel</button>
					</div>
				) : (
					<button onClick={() => setConfirmDelete(true)} className="bg-rose-600/20 text-rose-400 border border-rose-600/50 px-4 py-2.5 rounded-xl text-sm">Delete</button>
				)}
			</div>
		</div>
	)
}

/* ── Product Edit ── */
function ProductEditForm({ product, orgId, restId, onCancel, onSuccess }: { product: IProduct; orgId: string; restId: string; onCancel: () => void; onSuccess: () => void }) {
	const { register, handleSubmit, formState: { errors } } = useForm<IProductUpdate>({
		defaultValues: { name: product.name, price: product.price, description: product.description || '', calories: product.calories, timeCooking: product.timeCooking }
	})

	const { mutate, isPending } = useMutation({
		mutationFn: (data: IProductUpdate) => productService.update(orgId, restId, product.idProduct, data),
		onSuccess: () => { toast.success('Dish updated'); onSuccess() },
		onError: (error: any) => { const m = error.response?.data?.message || 'Failed to update'; toast.error(typeof m === 'string' ? m : m[0]) }
	})

	const onSubmit = (data: IProductUpdate) => {
		mutate({ name: data.name?.trim(), price: data.price !== undefined ? parseFloat(data.price.toFixed(2)) : undefined, description: data.description?.trim() || undefined, calories: data.calories, timeCooking: data.timeCooking })
	}

	return (
		<div>
			<h2 className="text-lg font-bold mb-4">Edit Dish</h2>
			<form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
				<div>
					<label className="block text-xs text-zinc-400 mb-1">Name *</label>
					<input {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Min 2 characters' } })} type="text" className="w-full px-3 py-2 border border-zinc-700 rounded-xl bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
					{errors.name && <span className="text-rose-400 text-xs">{errors.name.message}</span>}
				</div>
				<div>
					<label className="block text-xs text-zinc-400 mb-1">Price (₽) *</label>
					<input {...register('price', { required: 'Price is required', min: { value: 0.01, message: 'Must be > 0' }, valueAsNumber: true })} type="number" step="0.01" min="0" className="w-full px-3 py-2 border border-zinc-700 rounded-xl bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
					{errors.price && <span className="text-rose-400 text-xs">{errors.price.message}</span>}
				</div>
				<div>
					<label className="block text-xs text-zinc-400 mb-1">Description</label>
					<textarea {...register('description')} className="w-full px-3 py-2 border border-zinc-700 rounded-xl bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50" rows={2} />
				</div>
				<div className="grid grid-cols-2 gap-3">
					<div>
						<label className="block text-xs text-zinc-400 mb-1">Calories</label>
						<input {...register('calories', { valueAsNumber: true, validate: (v) => v === undefined || v >= 0 || 'Cannot be negative' })} type="number" step="1" min="0" className="w-full px-3 py-2 border border-zinc-700 rounded-xl bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
						{errors.calories && <span className="text-rose-400 text-xs">{errors.calories.message}</span>}
					</div>
					<div>
						<label className="block text-xs text-zinc-400 mb-1">Cooking time (min)</label>
						<input {...register('timeCooking', { valueAsNumber: true, validate: (v) => v === undefined || (Number.isInteger(v) && v >= 0) || 'Must be positive integer' })} type="number" step="1" min="0" className="w-full px-3 py-2 border border-zinc-700 rounded-xl bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
						{errors.timeCooking && <span className="text-rose-400 text-xs">{errors.timeCooking.message}</span>}
					</div>
				</div>
				<div className="flex gap-3 pt-2">
					<button type="submit" disabled={isPending} className="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl text-sm disabled:opacity-50">{isPending ? <MiniLoader /> : 'Save'}</button>
					<button type="button" onClick={onCancel} className="bg-zinc-700 text-white px-4 py-2.5 rounded-xl text-sm">Cancel</button>
				</div>
			</form>
		</div>
	)
}

/* ── Restaurant Edit ── */
function RestEditForm({ rest, orgId, restId, onCancel, onSuccess }: { rest: any; orgId: string; restId: string; onCancel: () => void; onSuccess: () => void }) {
	const formatTime = (value: string): string => { const d = value.replace(/[^\d]/g, ''); if (d.length === 0) return ''; if (d.length <= 2) return d; return `${d.slice(0, 2)}:${d.slice(2, 4)}` }

	const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<IRestaurantUpdate>({
		defaultValues: { name: rest.name, cuisine: rest.cuisine || '', timeOpened: new Date(rest.timeOpened).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }), timeClosed: new Date(rest.timeClosed).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) }
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
					<input {...register('name', { required: 'Required', minLength: { value: 2, message: 'Min 2 chars' } })} className="w-full px-3 py-2 border border-zinc-700 rounded-xl bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
					{errors.name && <span className="text-rose-400 text-xs">{errors.name.message}</span>}
				</div>
				<div>
					<label className="block text-xs text-zinc-400 mb-1">Cuisine</label>
					<input {...register('cuisine')} className="w-full px-3 py-2 border border-zinc-700 rounded-xl bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
				</div>
				<div className="grid grid-cols-2 gap-3">
					<div>
						<label className="block text-xs text-zinc-400 mb-1">Open (HH:MM)</label>
						<input value={watch('timeOpened') || ''} onChange={(e) => setValue('timeOpened', formatTime(e.target.value))} maxLength={5} className="w-full px-3 py-2 border border-zinc-700 rounded-xl bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50" placeholder="10:00" />
						{errors.timeOpened && <span className="text-rose-400 text-xs">{errors.timeOpened.message}</span>}
					</div>
					<div>
						<label className="block text-xs text-zinc-400 mb-1">Close (HH:MM)</label>
						<input value={watch('timeClosed') || ''} onChange={(e) => setValue('timeClosed', formatTime(e.target.value))} maxLength={5} className="w-full px-3 py-2 border border-zinc-700 rounded-xl bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50" placeholder="22:00" />
						{errors.timeClosed && <span className="text-rose-400 text-xs">{errors.timeClosed.message}</span>}
					</div>
				</div>
				<div className="flex gap-3 pt-2">
					<button type="submit" disabled={isPending} className="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl text-sm disabled:opacity-50">{isPending ? <MiniLoader /> : 'Save'}</button>
					<button type="button" onClick={onCancel} className="bg-zinc-700 text-white px-4 py-2.5 rounded-xl text-sm">Cancel</button>
				</div>
			</form>
		</div>
	)
}
