export interface IRestaurant {
	idRestaurant: string
	name: string
	description?: string
	cuisine?: string
	timeOpened: string
	timeClosed: string
	organizationId: string
	address?: {
		addressId: string
		address: {
			idAddress: string
			address: string
			floor?: string
			comment?: string
			cordinatY: number
			cordinatX: number
		}
	}
}

export interface IRestaurantCreate {
	name: string
	description?: string
	cuisine?: string
	timeOpened: string
	timeClosed: string
	address: string
	floor?: string
	comment?: string
	lat?: number
	lon?: number
}
