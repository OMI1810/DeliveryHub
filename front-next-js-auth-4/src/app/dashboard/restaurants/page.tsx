import type { Metadata } from 'next'
import { RestaurantsCatalog } from './RestaurantsCatalog'

export const metadata: Metadata = {
	title: 'Restaurants'
}

export default function RestaurantsPage() {
	return <RestaurantsCatalog />
}
