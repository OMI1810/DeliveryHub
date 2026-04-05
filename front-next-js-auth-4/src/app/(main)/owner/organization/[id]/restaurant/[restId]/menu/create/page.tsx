'use client'

import { MiniLoader } from '@/components/ui/MiniLoader'
import { OWNER_PAGES } from '@/config/pages/owner.config'
import productService from '@/services/product.service'
import { IProductCreate } from '@/types/product.types'
import { useMutation } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

export default function CreateProductPage() {
	const { id: orgId, restId } = useParams()
	const router = useRouter()
	const orgIdStr = orgId as string
	const restIdStr = restId as string

	const { register, handleSubmit, formState: { errors } } = useForm<IProductCreate>({
		defaultValues: { description: '', calories: undefined, timeCooking: undefined }
	})

	const { mutate, isPending } = useMutation({
		mutationFn: (data: IProductCreate) => productService.create(orgIdStr, restIdStr, data),
		onSuccess: () => { toast.success('Dish added successfully!'); router.push(OWNER_PAGES.RESTAURANT_MENU(orgIdStr, restIdStr)) },
		onError: (error: any) => { const m = error.response?.data?.message || 'Failed to create dish'; toast.error(typeof m === 'string' ? m : m[0]) }
	})

	const onSubmit = (data: IProductCreate) => {
		mutate({ name: data.name.trim(), price: parseFloat(data.price.toFixed(2)), description: data.description?.trim() || undefined, calories: data.calories, timeCooking: data.timeCooking })
	}

	return (
		<div className="space-y-4">
			<button onClick={() => router.push(OWNER_PAGES.RESTAURANT_MENU(orgIdStr, restIdStr))} className="inline-block text-zinc-400 text-sm">← Back to menu</button>
			<h1 className="text-xl font-bold">Add Dish</h1>

			<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
				<div>
					<label className="block text-xs font-medium mb-1.5 text-zinc-300">Name *</label>
					<input {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Min 2 characters' } })} type="text" className="w-full px-3 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50" placeholder="Dish name" />
					{errors.name && <span className="text-rose-400 text-xs mt-1 block">{errors.name.message}</span>}
				</div>

				<div>
					<label className="block text-xs font-medium mb-1.5 text-zinc-300">Price (₽) *</label>
					<input {...register('price', { required: 'Price is required', min: { value: 0.01, message: 'Price must be > 0' }, valueAsNumber: true })} type="number" step="0.01" min="0" className="w-full px-3 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50" placeholder="450.00" />
					{errors.price && <span className="text-rose-400 text-xs mt-1 block">{errors.price.message}</span>}
				</div>

				<div>
					<label className="block text-xs font-medium mb-1.5 text-zinc-300">Description</label>
					<textarea {...register('description')} className="w-full px-3 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50" placeholder="Ingredients, taste" rows={3} />
				</div>

				<div className="grid grid-cols-2 gap-3">
					<div>
						<label className="block text-xs font-medium mb-1.5 text-zinc-300">Calories</label>
						<input {...register('calories', { valueAsNumber: true, validate: (v) => v === undefined || v >= 0 || 'Cannot be negative' })} type="number" step="1" min="0" className="w-full px-3 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50" placeholder="250" />
						{errors.calories && <span className="text-rose-400 text-xs mt-1 block">{errors.calories.message}</span>}
					</div>
					<div>
						<label className="block text-xs font-medium mb-1.5 text-zinc-300">Cooking time (min)</label>
						<input {...register('timeCooking', { valueAsNumber: true, validate: (v) => v === undefined || (Number.isInteger(v) && v >= 0) || 'Must be positive integer' })} type="number" step="1" min="0" className="w-full px-3 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50" placeholder="15" />
						{errors.timeCooking && <span className="text-rose-400 text-xs mt-1 block">{errors.timeCooking.message}</span>}
					</div>
				</div>

				<button type="submit" disabled={isPending} className="w-full bg-emerald-600 text-white py-3 rounded-xl text-sm font-medium active:bg-emerald-700 disabled:opacity-50 flex justify-center items-center">
					{isPending ? <MiniLoader /> : 'Add dish'}
				</button>
			</form>
		</div>
	)
}
