'use client'
import { useMapEvents } from 'react-leaflet'
import { IGeoResult } from '@/types/arcgis.types'

interface Props {
	onLocationSelect: (geo: IGeoResult) => void
}

export function MapClickHandler({ onLocationSelect }: Props) {
	useMapEvents({
		click(e) {
			onLocationSelect({
				lat: e.latlng.lat,
				lon: e.latlng.lng,
				displayName: '',
				score: 100
			})
		}
	})
	return null
}
