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
		defaultValues: { phone: '' }
	})

	register('phone', {
		validate: (value) => {
			if (!value) return true
			if (!validatePhone(value)) return 'Invalid phone format'
			return true
		}
	})

	const { mutate, isPending } = useMutation({
		mutationFn: (data: IOrganizationCreate) => {
			const cleanedData = { ...data, phone: data.phone ? cleanPhone(data.phone) : undefined }
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

	const onSubmit = (data: IOrganizationCreate) => { mutate(data) }

	return (
		<div className="space-y-4">
			<h1 className="text-xl font-bold">Create Organization</h1>

			<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
				<div>
					<label className="block text-xs font-medium mb-1.5 text-zinc-300">Name *</label>
					<input
						{...register('name', { required: 'Name is required' })}
						type="text"
						className="w-full px-3 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
						placeholder="Organization name"
					/>
					{errors.name && <span className="text-rose-400 text-xs mt-1 block">{errors.name.message}</span>}
				</div>

				<div>
					<label className="block text-xs font-medium mb-1.5 text-zinc-300">Email *</label>
					<input
						{...register('email', { required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email format' } })}
						type="email"
						className="w-full px-3 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
						placeholder="info@organization.com"
					/>
					{errors.email && <span className="text-rose-400 text-xs mt-1 block">{errors.email.message}</span>}
				</div>

				<div>
					<label className="block text-xs font-medium mb-1.5 text-zinc-300">Phone (Optional)</label>
					<PhoneInput
						value={watch('phone') || ''}
						onChange={(value) => setValue('phone', value)}
						error={!!errors.phone}
					/>
					{errors.phone && <span className="text-rose-400 text-xs mt-1 block">{errors.phone.message}</span>}
				</div>

				<button
					type="submit"
					disabled={isPending}
					className="w-full bg-emerald-600 text-white py-3 rounded-xl text-sm font-medium active:bg-emerald-700 disabled:opacity-50 flex justify-center items-center"
				>
					{isPending ? <MiniLoader /> : 'Create'}
				</button>
			</form>
		</div>
	)
}
