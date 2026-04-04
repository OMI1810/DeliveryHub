export interface IProduct {
	idProduct: string
	name: string
	price: number
	description?: string
	calories?: number
	timeCooking?: number
	restaurantId: string
}

export interface IProductCreate {
	name: string
	price: number
	description?: string
	calories?: number
	timeCooking?: number
}

export interface IProductUpdate {
	name?: string
	price?: number
	description?: string
	calories?: number
	timeCooking?: number
}
