'use client'

import { MiniLoader } from '@/components/ui/MiniLoader'
import { AddressAutocomplete } from '@/components/ui/address/AddressAutocomplete'
import { AddressMap } from '@/components/ui/address/AddressMap'
import { OWNER_PAGES } from '@/config/pages/owner.config'
import arcgisService from '@/services/arcgis.service'
import restaurantService from '@/services/restaurant.service'
import { IGeoResult } from '@/types/arcgis.types'
import { IRestaurantCreate } from '@/types/restaurant.types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import toast from 'react-hot-toast'

const DEFAULT_CENTER: [number, number] = [55.7558, 37.6173]

export default function CreateRestaurantPage() {
	const { id } = useParams()
	const router = useRouter()
	const queryClient = useQueryClient()
	const orgId = id as string

	// Restaurant fields
	const [name, setName] = useState('')
	const [cuisine, setCuisine] = useState('')
	const [description, setDescription] = useState('')
	const [timeOpened, setTimeOpened] = useState('')
	const [timeClosed, setTimeClosed] = useState('')

	// Address fields (same as /dashboard/addresses)
	const [address, setAddress] = useState('')
	const [lat, setLat] = useState<number | undefined>(undefined)
	const [lon, setLon] = useState<number | undefined>(undefined)
	const [floor, setFloor] = useState('')
	const [comment, setComment] = useState('')
	const [mapCenter, setMapCenter] = useState<[number, number]>(DEFAULT_CENTER)
	const [isResolving, setIsResolving] = useState(false)

	const { mutate, isPending } = useMutation({
		mutationFn: (data: IRestaurantCreate) => restaurantService.create(orgId, data),
		onSuccess: () => {
			toast.success('Restaurant created successfully!')
			queryClient.invalidateQueries({ queryKey: ['restaurants', orgId] })
			router.push(OWNER_PAGES.ORGANIZATION(orgId))
		},
		onError: (error: any) => {
			const message = error.response?.data?.message || 'Failed to create restaurant'
			toast.error(typeof message === 'string' ? message : message[0])
		}
	})

	// Same handlers as AddressForm
	const handleAddressSelect = (selectedAddress: string, geo: IGeoResult) => {
		setAddress(selectedAddress)
		setLat(geo.lat)
		setLon(geo.lon)
		setMapCenter([geo.lat, geo.lon])
	}

	const handleMapLocationSelect = async (geo: IGeoResult) => {
		setLat(geo.lat)
		setLon(geo.lon)
		setMapCenter([geo.lat, geo.lon])

		if (!geo.displayName) {
			setIsResolving(true)
			try {
				const response = await arcgisService.reverseGeocode(geo.lat, geo.lon)
				setAddress(response.data.displayName)
			} catch (err) {
				console.error('Reverse geocoding error:', err)
				setAddress(`Координаты: ${geo.lat.toFixed(6)}, ${geo.lon.toFixed(6)}`)
			} finally {
				setIsResolving(false)
			}
		} else {
			setAddress(geo.displayName)
		}
	}

	// Time formatting: auto-insert colon
	const formatTime = (value: string): string => {
		const digits = value.replace(/[^\d]/g, '')
		if (digits.length === 0) return ''
		if (digits.length <= 2) return digits
		return `${digits.slice(0, 2)}:${digits.slice(2, 4)}`
	}

	const validateTime = (time: string, label: string): string | null => {
		const regex = /^([01]\d|2[0-3]):[0-5]\d$/
		if (!regex.test(time)) {
			return `Invalid ${label} format. Use HH:MM (00:00 — 23:59)`
		}
		return null
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()

		if (!name.trim()) { toast.error('Restaurant name is required'); return }
		if (!address.trim()) { toast.error('Address is required'); return }

		const openErr = validateTime(timeOpened, 'opening')
		if (openErr) { toast.error(openErr); return }
		const closeErr = validateTime(timeClosed, 'closing')
		if (closeErr) { toast.error(closeErr); return }

		mutate({
			name: name.trim(),
			cuisine: cuisine.trim() || undefined,
			description: description.trim() || undefined,
			timeOpened,
			timeClosed,
			address: address.trim(),
			floor: floor.trim() || undefined,
			comment: comment.trim() || undefined,
			lat,
			lon
		})
	}

	return (
		<div className="p-8 max-w-2xl mx-auto mt-10">
			<button
				onClick={() => router.push(OWNER_PAGES.ORGANIZATION(orgId))}
				className="inline-block text-zinc-400 hover:text-primary mb-6 transition-colors"
			>
				← Back to organization
			</button>

			<h1 className="text-2xl font-bold mb-6">Create Restaurant</h1>

			<form onSubmit={handleSubmit} className="space-y-4">
				{/* Name */}
				<div>
					<label className="block text-sm font-medium mb-1">Name *</label>
					<input
						type="text"
						value={name}
						onChange={(e) => setName(e.target.value)}
						className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
						placeholder="Restaurant name"
						required
					/>
				</div>

				{/* Cuisine */}
				<div>
					<label className="block text-sm font-medium mb-1">Cuisine</label>
					<input
						type="text"
						value={cuisine}
						onChange={(e) => setCuisine(e.target.value)}
						className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
						placeholder="Italian, Japanese, etc."
					/>
				</div>

				{/* Description */}
				<div>
					<label className="block text-sm font-medium mb-1">Description</label>
					<textarea
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
						placeholder="Brief description"
						rows={3}
					/>
				</div>

				{/* ── Address section (same as /dashboard/addresses) ── */}
				<div className="border-t border-zinc-700 pt-4">
					<h2 className="text-lg font-semibold mb-3">Address *</h2>

					<div className="mb-3">
						<label className="block text-sm font-medium mb-1">
							Or choose a point on the map
						</label>
						<AddressMap
							center={mapCenter}
							onLocationSelect={handleMapLocationSelect}
						/>
						{isResolving && (
							<p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
								<span className="inline-block w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin" />
								Determining address...
							</p>
						)}
					</div>

					<div className="mb-3">
						<label className="block text-sm font-medium mb-1">Address *</label>
						<AddressAutocomplete
							value={address}
							onSelect={handleAddressSelect}
							onManualInput={(manualAddress) => {
								setAddress(manualAddress)
								setLat(undefined)
								setLon(undefined)
							}}
						/>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium mb-1">Floor</label>
							<input
								type="text"
								value={floor}
								onChange={(e) => setFloor(e.target.value)}
								className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
								placeholder="Floor"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium mb-1">Comment (how to find)</label>
							<input
								type="text"
								value={comment}
								onChange={(e) => setComment(e.target.value)}
								className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
								placeholder="Landmarks, directions"
							/>
						</div>
					</div>
				</div>

				{/* ── Working Hours ── */}
				<div className="border-t border-zinc-700 pt-4">
					<h2 className="text-lg font-semibold mb-3">Working Hours *</h2>

					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium mb-1">Opening time *</label>
							<input
								type="text"
								value={timeOpened}
								onChange={(e) => setTimeOpened(formatTime(e.target.value))}
								className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
								placeholder="10:00"
								maxLength={5}
								required
							/>
							<p className="text-xs text-zinc-500 mt-1">Format: HH:MM (00:00 — 23:59)</p>
						</div>

						<div>
							<label className="block text-sm font-medium mb-1">Closing time *</label>
							<input
								type="text"
								value={timeClosed}
								onChange={(e) => setTimeClosed(formatTime(e.target.value))}
								className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
								placeholder="22:00"
								maxLength={5}
								required
							/>
							<p className="text-xs text-zinc-500 mt-1">Format: HH:MM (00:00 — 23:59)</p>
						</div>
					</div>
				</div>

				<button
					type="submit"
					disabled={isPending || isResolving}
					className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary/90 transition disabled:opacity-70 flex justify-center items-center h-[40px]"
				>
					{isPending ? <MiniLoader width={20} height={20} /> : 'Create'}
				</button>
			</form>
		</div>
	)
}
