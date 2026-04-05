export interface IOrganization {
	idOrganization: string
	name: string
	email: string
	phone?: string
	ownerId: string
}

export interface IOrganizationCreate {
	name: string
	email: string
	phone?: string
}

export interface IOrganizationUpdate {
	name?: string
	email?: string
	phone?: string
}

export interface IOrganizationResponse {
	organizations: IOrganization[]
}
