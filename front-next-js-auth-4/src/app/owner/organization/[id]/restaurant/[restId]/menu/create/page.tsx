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
		defaultValues: {
			description: '',
			calories: undefined,
			timeCooking: undefined
		}
	})

	const { mutate, isPending } = useMutation({
		mutationFn: (data: IProductCreate) => productService.create(orgIdStr, restIdStr, data),
		onSuccess: () => {
			toast.success('Dish added successfully!')
			router.push(OWNER_PAGES.RESTAURANT_MENU(orgIdStr, restIdStr))
		},
		onError: (error: any) => {
			const message = error.response?.data?.message || 'Failed to create dish'
			toast.error(typeof message === 'string' ? message : message[0])
		}
	})

	const onSubmit = (data: IProductCreate) => {
		const dto: IProductCreate = {
			name: data.name.trim(),
			price: parseFloat(data.price.toFixed(2)),
			description: data.description?.trim() || undefined,
			calories: data.calories,
			timeCooking: data.timeCooking
		}
		mutate(dto)
	}

	return (
		<div className="p-8 max-w-xl mx-auto mt-10">
			<button
				onClick={() => router.push(OWNER_PAGES.RESTAURANT_MENU(orgIdStr, restIdStr))}
				className="inline-block text-zinc-400 hover:text-primary mb-6 transition-colors"
			>
				← Back to menu
			</button>

			<h1 className="text-2xl font-bold mb-6">Add Dish</h1>

			<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
				{/* Name */}
				<div>
					<label className="block text-sm font-medium mb-1">Name *</label>
					<input
						{...register('name', {
							required: 'Name is required',
							minLength: { value: 2, message: 'Name must be at least 2 characters' }
						})}
						type="text"
						className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
						placeholder="Dish name"
					/>
					{errors.name && <span className="text-red-500 text-sm mt-1">{errors.name.message}</span>}
				</div>

				{/* Price */}
				<div>
					<label className="block text-sm font-medium mb-1">Price (₽) *</label>
					<input
						{...register('price', {
							required: 'Price is required',
							min: { value: 0.01, message: 'Price must be greater than 0' },
							valueAsNumber: true
						})}
						type="number"
						step="0.01"
						min="0"
						className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
						placeholder="450.00"
					/>
					{errors.price && <span className="text-red-500 text-sm mt-1">{errors.price.message}</span>}
				</div>

				{/* Description */}
				<div>
					<label className="block text-sm font-medium mb-1">Description</label>
					<textarea
						{...register('description')}
						className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
						placeholder="Ingredients, taste description"
						rows={3}
					/>
				</div>

				{/* Calories + Time Cooking */}
				<div className="grid grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-medium mb-1">Calories</label>
						<input
							{...register('calories', {
								valueAsNumber: true,
								validate: (v) => v === undefined || v >= 0 || 'Cannot be negative'
							})}
							type="number"
							step="1"
							min="0"
							className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
							placeholder="250"
						/>
						{errors.calories && <span className="text-red-500 text-sm mt-1">{errors.calories.message}</span>}
					</div>

					<div>
						<label className="block text-sm font-medium mb-1">Cooking time (min)</label>
						<input
							{...register('timeCooking', {
								valueAsNumber: true,
								validate: (v) => v === undefined || (Number.isInteger(v) && v >= 0) || 'Must be a positive integer'
							})}
							type="number"
							step="1"
							min="0"
							className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
							placeholder="15"
						/>
						{errors.timeCooking && <span className="text-red-500 text-sm mt-1">{errors.timeCooking.message}</span>}
					</div>
				</div>

				<button
					type="submit"
					disabled={isPending}
					className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary/90 transition disabled:opacity-70 flex justify-center items-center h-[40px]"
				>
					{isPending ? <MiniLoader width={20} height={20} /> : 'Add dish'}
				</button>
			</form>
		</div>
	)
}
