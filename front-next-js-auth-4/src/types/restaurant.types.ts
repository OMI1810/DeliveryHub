export interface IRestaurant {
	idRestaurant: string
	name: string
	description?: string
	cuisine?: string
	timeOpened: string
	timeClosed: string
	organizationId: string
}

export interface IRestaurantCreate {
	name: string
	description?: string
	cuisine?: string
	timeOpened: string
	timeClosed: string
}
