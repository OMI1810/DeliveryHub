'use client'

import { MiniLoader } from '@/components/ui/MiniLoader'
import { DASHBOARD_PAGES } from '@/config/pages/dashboard.config'
import restaurantService from '@/services/restaurant.service'
import { IPublicRestaurant } from '@/types/restaurant.types'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useMemo, useState } from 'react'

const formatTime = (iso: string) => {
	if (!iso) return '—'
	const d = new Date(iso)
	return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export function RestaurantsCatalog() {
	const { data, isLoading } = useQuery({
		queryKey: ['public-restaurants'],
		queryFn: () => restaurantService.getAllPublic()
	})

	const [search, setSearch] = useState('')
	const [cuisineFilter, setCuisineFilter] = useState('Все')

	const restaurants: IPublicRestaurant[] = data?.data || []

	// Уникальные кухни для dropdown
	const cuisines = useMemo(() => {
		const set = new Set(restaurants.map(r => r.cuisine).filter(Boolean) as string[])
		return ['Все', ...Array.from(set).sort()]
	}, [restaurants])

	// Фильтрация
	const filtered = useMemo(() => {
		const q = search.toLowerCase()
		return restaurants.filter(r =>
			(cuisineFilter === 'Все' || r.cuisine === cuisineFilter) &&
			r.name.toLowerCase().includes(q)
		)
	}, [restaurants, search, cuisineFilter])

	if (isLoading) {
		return (
			<div className="flex justify-center mt-10">
				<MiniLoader width={50} height={50} />
			</div>
		)
	}

	return (
		<div className="mt-4 max-w-5xl mx-auto">
			<h2 className="text-2xl font-bold mb-6">Restaurants</h2>

			{/* Фильтры */}
			<div className="flex flex-col sm:flex-row gap-4 mb-6">
				<input
					type="text"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					placeholder="Search by name..."
					className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
				/>
				<select
					value={cuisineFilter}
					onChange={(e) => setCuisineFilter(e.target.value)}
					className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-transparent"
				>
					{cuisines.map(c => (
						<option key={c} value={c}>{c}</option>
					))}
				</select>
			</div>

			{/* Результаты */}
			<p className="text-sm text-zinc-500 mb-4">
				{filtered.length} restaurant{filtered.length !== 1 ? 's' : ''} found
			</p>

			{filtered.length === 0 ? (
				<div className="text-center py-10 border border-dashed border-zinc-700 rounded-lg">
					<p className="text-zinc-400">No restaurants found</p>
					<p className="text-sm text-zinc-500 mt-1">Try changing your search criteria</p>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{filtered.map(rest => (
						<RestaurantCard key={rest.idRestaurant} restaurant={rest} />
					))}
				</div>
			)}
		</div>
	)
}

function RestaurantCard({ restaurant }: { restaurant: IPublicRestaurant }) {
	return (
		<div className="border border-zinc-800 rounded-lg p-4 hover:border-primary/50 transition-colors">
			<h3 className="text-lg font-semibold mb-1">{restaurant.name}</h3>

			{restaurant.cuisine && (
				<p className="text-sm text-zinc-400 mb-2">🍽 {restaurant.cuisine}</p>
			)}

			<p className="text-xs text-zinc-500 mb-2">
				🕐 {formatTime(restaurant.timeOpened)} — {formatTime(restaurant.timeClosed)}
			</p>

			{restaurant.description && (
				<p className="text-sm text-zinc-400 mb-3 line-clamp-2">{restaurant.description}</p>
			)}

			{restaurant.address?.address && (
				<p className="text-xs text-zinc-500 mb-3">📍 {restaurant.address.address.address}</p>
			)}

			<p className="text-xs text-zinc-500 mb-3">
				🏢 {restaurant.organization.name}
			</p>

			<Link
				href={DASHBOARD_PAGES.RESTAURANT_MENU(restaurant.idRestaurant)}
				className="inline-block text-primary text-sm hover:underline"
			>
				View menu →
			</Link>
		</div>
	)
}
