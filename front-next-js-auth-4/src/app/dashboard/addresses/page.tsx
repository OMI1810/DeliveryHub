import type { Metadata } from 'next'
import { AddressForm } from './AddressForm'
import { AddressList } from './AddressList'

export const metadata: Metadata = {
	title: 'Мои адреса'
}

export default function Page() {
	return (
		<div className="mt-4">
			<h2 className="text-2xl font-bold mb-6">Управление адресами</h2>
			<AddressForm />
			<AddressList />
		</div>
	)
}
