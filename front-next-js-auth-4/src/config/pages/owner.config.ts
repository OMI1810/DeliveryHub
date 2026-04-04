class OwnerPages {
	HOME = '/owner'
	CREATE = '/owner/create'
	ORGANIZATION = (id: string) => `/owner/organization/${id}`
	RESTAURANT_CREATE = (orgId: string) => `/owner/organization/${orgId}/restaurant/create`
}

export const OWNER_PAGES = new OwnerPages()
