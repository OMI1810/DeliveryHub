'use client'

import { AddToCartButton } from '@/components/ui/AddToCartButton'
import { MiniLoader } from '@/components/ui/MiniLoader'
import restaurantService from '@/services/restaurant.service'
import { IProduct } from '@/types/product.types'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function RestaurantMenuPage() {
	const { id } = useParams()
	const restaurantId = id as string

	const { data: restData, isLoading: restLoading } = useQuery({
		queryKey: ['public-restaurant', restaurantId],
		queryFn: () => restaurantService.getPublicById(restaurantId),
		enabled: !!restaurantId
	})

	const { data: productsData, isLoading: productsLoading } = useQuery({
		queryKey: ['restaurant-products', restaurantId],
		queryFn: () => restaurantService.getRestaurantProducts(restaurantId),
		enabled: !!restaurantId
	})

	const isLoading = restLoading || productsLoading

	if (isLoading) {
		return (
			<div className="flex justify-center mt-10">
				<MiniLoader width={50} height={50} />
			</div>
		)
	}

	const restaurant = restData?.data
	if (!restaurant) {
		return (
			<div className="mt-10 text-center">
				<p className="text-zinc-400 text-xl">Restaurant not found</p>
				<Link href="/dashboard/restaurants" className="text-primary hover:underline mt-2 inline-block">
					← Back to restaurants
				</Link>
			</div>
		)
	}

	const products: IProduct[] = productsData?.data || []

	return (
		<div className="mt-4 max-w-5xl mx-auto pb-20">
			<Link
				href="/dashboard/restaurants"
				className="inline-block text-zinc-400 hover:text-primary mb-6 transition-colors"
			>
				← Back to restaurants
			</Link>

			{/* Restaurant header */}
			<div className="mb-8">
				<h1 className="text-3xl font-bold">{restaurant.name}</h1>
				{restaurant.cuisine && (
					<p className="text-zinc-400 mt-1">🍽 {restaurant.cuisine}</p>
				)}
				<p className="text-sm text-zinc-500 mt-1">
					🕐 {new Date(restaurant.timeOpened).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
					{' — '}
					{new Date(restaurant.timeClosed).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
				</p>
				{restaurant.description && (
					<p className="text-zinc-400 mt-2">{restaurant.description}</p>
				)}
				{restaurant.address?.address && (
					<p className="text-sm text-zinc-500 mt-2">📍 {restaurant.address.address.address}</p>
				)}
			</div>

			{/* Menu */}
			<h2 className="text-xl font-semibold mb-4">Menu</h2>

			{products.length === 0 ? (
				<div className="text-center py-10 border border-dashed border-zinc-700 rounded-lg">
					<p className="text-zinc-400">No items on the menu yet</p>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{products.map(product => (
						<div
							key={product.idProduct}
							className="border border-zinc-800 rounded-lg p-4 flex flex-col"
						>
							<h3 className="font-semibold mb-1">{product.name}</h3>

							{product.description && (
								<p className="text-sm text-zinc-400 mb-2 line-clamp-2">{product.description}</p>
							)}

							<div className="mt-auto space-y-1">
								{product.calories !== null && product.calories !== undefined && (
									<p className="text-xs text-zinc-500">🔥 {product.calories} kcal</p>
								)}
								{product.timeCooking !== null && product.timeCooking !== undefined && (
									<p className="text-xs text-zinc-500">⏱ {product.timeCooking} min</p>
								)}

								<div className="flex items-center justify-between pt-2">
									<span className="text-lg font-bold">{product.price.toFixed(2)} ₽</span>
									<AddToCartButton
										productId={product.idProduct}
										productName={product.name}
										productPrice={product.price}
										restaurantId={restaurant.idRestaurant}
										restaurantName={restaurant.name}
									/>
								</div>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	)
}
