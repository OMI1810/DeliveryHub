export interface ICashier {
	idUser: string
	email: string
	name: string
	surname?: string
	cashierRestaurantId?: string
}

export interface IAssignCashierResult {
	idUser: string
	email: string
	name: string
	surname?: string
	cashierRestaurantId: string
}

export interface ICreateCashier {
	email: string
	password: string
	name: string
}

export interface ICashierOrderProduct {
	idOrderProduct: string
	quantity: number
	price: number
	product: {
		idProduct: string
		name: string
	}
}

export interface ICashierOrder {
	idOrder: string
	status: string
	createAt: string
	payStatus: boolean
	products: ICashierOrderProduct[]
	address: {
		idAddress: string
		address: string
	}
	restaraunt: {
		idRestaurant: string
		name: string
	}
	client: {
		idUser: string
		name: string
		surname: string
		phone: string
	}
}
