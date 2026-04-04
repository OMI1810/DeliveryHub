'use client'

import { MiniLoader } from '@/components/ui/MiniLoader'
import { OWNER_PAGES } from '@/config/pages/owner.config'
import restaurantService from '@/services/restaurant.service'
import { IRestaurantCreate } from '@/types/restaurant.types'
import { useMutation } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

export default function CreateRestaurantPage() {
	const { id } = useParams()
	const router = useRouter()
	const orgId = id as string

	const { register, handleSubmit, formState: { errors } } = useForm<IRestaurantCreate>({
		defaultValues: {
			description: '',
			cuisine: '',
			timeOpened: '10:00',
			timeClosed: '22:00'
		}
	})

	const { mutate, isPending } = useMutation({
		mutationFn: (data: IRestaurantCreate) => restaurantService.create(orgId, data),
		onSuccess: () => {
			toast.success('Restaurant created successfully!')
			router.push(OWNER_PAGES.ORGANIZATION(orgId))
		},
		onError: (error: any) => {
			const message = error.response?.data?.message || 'Failed to create restaurant'
			toast.error(typeof message === 'string' ? message : message[0])
		}
	})

	const onSubmit = (data: IRestaurantCreate) => {
		mutate(data)
	}

	return (
		<div className="p-8 max-w-xl mx-auto mt-10">
			<button
				onClick={() => router.push(OWNER_PAGES.ORGANIZATION(orgId))}
				className="inline-block text-zinc-400 hover:text-primary mb-6 transition-colors"
			>
				← Back to organization
			</button>

			<h1 className="text-2xl font-bold mb-6">Create Restaurant</h1>

			<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
				<div>
					<label className="block text-sm font-medium mb-1">Name</label>
					<input
						{...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Name must be at least 2 characters' } })}
						type="text"
						className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
						placeholder="Restaurant name"
					/>
					{errors.name && <span className="text-red-500 text-sm mt-1">{errors.name.message}</span>}
				</div>

				<div>
					<label className="block text-sm font-medium mb-1">Description (Optional)</label>
					<textarea
						{...register('description')}
						className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
						placeholder="Brief description"
						rows={3}
					/>
				</div>

				<div>
					<label className="block text-sm font-medium mb-1">Cuisine (Optional)</label>
					<input
						{...register('cuisine')}
						type="text"
						className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
						placeholder="Italian, Japanese, etc."
					/>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-medium mb-1">Opening Time</label>
						<input
							{...register('timeOpened', { required: 'Opening time is required', pattern: { value: /^([01]\d|2[0-3]):[0-5]\d$/, message: 'Format: HH:MM' } })}
							type="text"
							className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
							placeholder="10:00"
						/>
						{errors.timeOpened && <span className="text-red-500 text-sm mt-1">{errors.timeOpened.message}</span>}
					</div>

					<div>
						<label className="block text-sm font-medium mb-1">Closing Time</label>
						<input
							{...register('timeClosed', { required: 'Closing time is required', pattern: { value: /^([01]\d|2[0-3]):[0-5]\d$/, message: 'Format: HH:MM' } })}
							type="text"
							className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
							placeholder="22:00"
						/>
						{errors.timeClosed && <span className="text-red-500 text-sm mt-1">{errors.timeClosed.message}</span>}
					</div>
				</div>

				<button
					type="submit"
					disabled={isPending}
					className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary/90 transition disabled:opacity-70 flex justify-center items-center h-[40px]"
				>
					{isPending ? <MiniLoader width={20} height={20} /> : 'Create'}
				</button>
			</form>
		</div>
	)
}
