'use client'
import { IGeoResult } from '@/types/arcgis.types'
import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'
import 'leaflet/dist/leaflet.css'
import './map-marker.css'
import L from 'leaflet'
import { MapClickHandler } from './MapClickHandler'

const MapContainer = dynamic(
	() => import('react-leaflet').then((mod) => mod.MapContainer),
	{ ssr: false }
)
const TileLayer = dynamic(
	() => import('react-leaflet').then((mod) => mod.TileLayer),
	{ ssr: false }
)
const Marker = dynamic(
	() => import('react-leaflet').then((mod) => mod.Marker),
	{ ssr: false }
)

// Кастомная иконка маркера — красивая капля
const customIcon = L.divIcon({
	html: `
    <div class="custom-marker-pin">
      <svg width="32" height="42" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 26 16 26s16-14 16-26C32 7.163 24.837 0 16 0z" fill="#ef4444" stroke="#fff" stroke-width="2"/>
        <circle cx="16" cy="15" r="6" fill="#fff"/>
        <circle cx="16" cy="15" r="3" fill="#ef4444"/>
      </svg>
    </div>
  `,
	className: '',
	iconSize: [32, 42],
	iconAnchor: [16, 42],
	popupAnchor: [0, -42]
})

interface Props {
	center: [number, number]
	onLocationSelect: (geo: IGeoResult) => void
}

export function AddressMap({ center, onLocationSelect }: Props) {
	const [isMounted, setIsMounted] = useState(false)
	const [markerPosition, setMarkerPosition] = useState<[number, number]>(center)

	useEffect(() => {
		setIsMounted(true)
	}, [])

	useEffect(() => {
		setMarkerPosition(center)
	}, [center])

	const handleMapClick = (geo: IGeoResult) => {
		setMarkerPosition([geo.lat, geo.lon])
		onLocationSelect(geo)
	}

	if (!isMounted) {
		return (
			<div className="w-full h-[300px] bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
				Карта загружается...
			</div>
		)
	}

	return (
		<MapContainer
			center={center}
			zoom={13}
			style={{ height: '300px', width: '100%', borderRadius: '8px' }}
			attributionControl={false}
		>
			<TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
			<Marker position={markerPosition} icon={customIcon} />
			<MapClickHandler onLocationSelect={handleMapClick} />
		</MapContainer>
	)
}
