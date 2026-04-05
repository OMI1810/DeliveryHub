'use client'

import { PUBLIC_PAGES } from '@/config/pages/public.config'
import authService from '@/services/auth/auth.service'
import { IFormData } from '@/types/auth.types'
import { cleanPhone, validatePhone } from '@/utils/phone'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { FieldErrors, SubmitHandler, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

export function useAuthForm(isLogin: boolean) {
	const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<IFormData>()

	const router = useRouter()
	const [isPending, startTransition] = useTransition()

	const { mutate: mutateLogin, isPending: isLoginPending } = useMutation({
		mutationKey: ['login'],
		mutationFn: (data: IFormData) => authService.main('login', data),
		onSuccess() {
			startTransition(() => {
				reset()
				router.push(PUBLIC_PAGES.HOME)
			})
		},
		onError(error) {
			if (axios.isAxiosError(error)) {
				toast.error(error.response?.data?.message)
			}
		}
	})

	const { mutate: mutateRegister, isPending: isRegisterPending } = useMutation({
		mutationKey: ['register'],
		mutationFn: (data: IFormData) => {
			const cleanedData = {
				...data,
				phone: data.phone ? cleanPhone(data.phone) : undefined
			}
			return authService.main('register', cleanedData)
		},
		onSuccess() {
			startTransition(() => {
				reset()
				router.push(PUBLIC_PAGES.HOME)
			})
		},
		onError(error) {
			if (axios.isAxiosError(error)) {
				toast.error(error.response?.data?.message)
			}
		}
	})

	const onSubmit: SubmitHandler<IFormData> = data => {
		if (isLogin) {
			mutateLogin(data)
		} else {
			// Validate phone if provided
			if (data.phone && !validatePhone(data.phone)) {
				toast.error('Invalid phone format')
				return
			}
			mutateRegister(data)
		}
	}

	const isLoading = isPending || isLoginPending || isRegisterPending

	return {
		register,
		handleSubmit,
		onSubmit,
		isLoading,
		watch,
		setValue,
		errors: errors as FieldErrors<IFormData>,
		cleanPhone
	}
}
