'use client'

import { cn } from '@/utils/classNames'
import { type ChangeEvent } from 'react'
import { formatPhone } from '@/utils/phone'

interface Props {
	value: string
	onChange: (value: string) => void
	error?: boolean
	placeholder?: string
	disabled?: boolean
}

export function PhoneInput({
	value,
	onChange,
	error,
	placeholder = '+7 999 123 45 67',
	disabled
}: Props) {
	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		const raw = e.target.value
		const formatted = formatPhone(raw)
		onChange(formatted)
	}

	return (
		<input
			type="tel"
			value={value}
			onChange={handleChange}
			placeholder={placeholder}
			disabled={disabled}
			className={cn(
				'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition',
				error
					? 'border-red-500 focus:ring-red-500/50'
					: 'border-zinc-700 focus:ring-primary/50 focus:border-primary',
				disabled && 'opacity-50 cursor-not-allowed'
			)}
		/>
	)
}
