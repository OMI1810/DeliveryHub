'use client'
import { useMapEvents } from 'react-leaflet'

interface Props {
  onLocationSelect: (lat: number, lon: number) => void
}

export function MapClickHandler({ onLocationSelect }: Props) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng)
    }
  })
  return null
}
