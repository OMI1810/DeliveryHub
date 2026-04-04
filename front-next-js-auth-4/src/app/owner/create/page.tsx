'use client'

import { MiniLoader } from '@/components/ui/MiniLoader'
import { PhoneInput } from '@/components/ui/PhoneInput'
import { OWNER_PAGES } from '@/config/pages/owner.config'
import organizationService from '@/services/organization.service'
import { IOrganizationCreate } from '@/types/organization.types'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { cleanPhone, validatePhone } from '@/utils/phone'

export default function CreateOrganizationPage() {
	const router = useRouter()
	const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<IOrganizationCreate>({
		defaultValues: {
			phone: ''
		}
	})

	// Register phone with validation
	register('phone', {
		validate: (value) => {
			if (!value) return true // optional field
			if (!validatePhone(value)) return 'Invalid phone format'
			return true
		}
	})

	const { mutate, isPending } = useMutation({
		mutationFn: (data: IOrganizationCreate) => {
			const cleanedData = {
				...data,
				phone: data.phone ? cleanPhone(data.phone) : undefined
			}
			return organizationService.create(cleanedData)
		},
		onSuccess: () => {
			toast.success('Organization created successfully!')
			router.push(OWNER_PAGES.HOME)
		},
		onError: (error: any) => {
			const message = error.response?.data?.message || 'Failed to create organization'
			toast.error(typeof message === 'string' ? message : message[0])
		}
	})

	const onSubmit = (data: IOrganizationCreate) => {
		mutate(data)
	}

	return (
		<div className="p-8 max-w-xl mx-auto mt-10">
			<h1 className="text-2xl font-bold mb-6">Create Organization</h1>

			<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
				<div>
					<label className="block text-sm font-medium mb-1">Name</label>
					<input
						{...register('name', { required: 'Name is required' })}
						type="text"
						className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
						placeholder="Organization name"
					/>
					{errors.name && <span className="text-red-500 text-sm mt-1">{errors.name.message}</span>}
				</div>

				<div>
					<label className="block text-sm font-medium mb-1">Email</label>
					<input
						{...register('email', {
							required: 'Email is required',
							pattern: {
								value: /\S+@\S+\.\S+/,
								message: 'Invalid email format'
							}
						})}
						type="email"
						className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
						placeholder="info@organization.com"
					/>
					{errors.email && <span className="text-red-500 text-sm mt-1">{errors.email.message}</span>}
				</div>

				<div>
					<label className="block text-sm font-medium mb-1">Phone (Optional)</label>
					<PhoneInput
						value={watch('phone') || ''}
						onChange={(value) => setValue('phone', value)}
						error={!!errors.phone}
					/>
					{errors.phone && <span className="text-red-500 text-sm mt-1">{errors.phone.message}</span>}
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
