'use client'

import { MiniLoader } from '@/components/ui/MiniLoader'
import { PhoneInput } from '@/components/ui/PhoneInput'
import { twMerge } from 'tailwind-merge'
import styles from './AuthForm.module.scss'
import { AuthToggle } from './AuthToggle'
import { useAuthForm } from './useAuthForm'

interface Props {
	isLogin: boolean
}

export function AuthForm({ isLogin }: Props) {
	const {
		handleSubmit,
		isLoading,
		onSubmit,
		register,
		watch,
		setValue,
		errors,
		cleanPhone
	} = useAuthForm(isLogin)

	return (
		<form
			onSubmit={handleSubmit(onSubmit)}
			className="max-w-sm mx-auto"
		>
			{!isLogin && (
				<>
					<div className="mb-3">
						<label className="text-gray-600">
							Surname
							<input
								type="text"
								placeholder="Enter surname"
								{...register('surname')}
								className={styles['input-field']}
							/>
						</label>
					</div>

					<div className="mb-3">
						<label className="text-gray-600">
							Name
							<input
								type="text"
								placeholder="Enter name"
								{...register('name')}
								className={styles['input-field']}
							/>
						</label>
					</div>

					<div className="mb-3">
						<label className="text-gray-600">
							Patronymic
							<input
								type="text"
								placeholder="Enter patronymic"
								{...register('patronymic')}
								className={styles['input-field']}
							/>
						</label>
					</div>

					<div className="mb-3">
						<label className="text-gray-600">
							Phone
							<PhoneInput
								value={watch('phone') || ''}
								onChange={(value) => setValue('phone', value)}
								error={!!errors.phone}
							/>
							{errors.phone && (
								<span className="text-red-500 text-xs mt-1 block">{errors.phone.message}</span>
							)}
						</label>
					</div>
				</>
			)}

			<div className="mb-4">
				<label className="text-gray-600">
					Email
					<input
						type="email"
						placeholder="Enter email"
						{...register('email', { required: 'Email is required' })}
						className={styles['input-field']}
					/>
					{errors.email && (
						<span className="text-red-500 text-xs mt-1 block">{errors.email.message}</span>
					)}
				</label>
			</div>

			<div className="mb-6">
				<label className="text-gray-600">
					Password
					<input
						type="password"
						placeholder="Enter password"
						{...register('password', {
							required: 'Password is required',
							minLength: { value: 6, message: 'Password must be at least 6 characters' }
						})}
						className={styles['input-field']}
					/>
					{errors.password && (
						<span className="text-red-500 text-xs mt-1 block">{errors.password.message}</span>
					)}
				</label>
			</div>

			<div className="mb-3">
				<button
					type="submit"
					className={twMerge(
						styles['btn-primary'],
						isLogin ? 'bg-primary' : 'bg-secondary',
						isLoading && 'opacity-75 cursor-not-allowed'
					)}
					disabled={isLoading}
				>
					{isLoading ? <MiniLoader /> : isLogin ? 'Sign In' : 'Sign Up'}
				</button>
			</div>

			<AuthToggle isLogin={isLogin} />
		</form>
	)
}
