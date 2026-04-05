class OwnerPages {
	HOME = '/owner'
	CREATE = '/owner/create'
	ORGANIZATION = (id: string) => `/owner/organization/${id}`
	RESTAURANT_CREATE = (orgId: string) => `/owner/organization/${orgId}/restaurant/create`
	RESTAURANT_MENU = (orgId: string, restId: string) => `/owner/organization/${orgId}/restaurant/${restId}/menu`
	RESTAURANT_STAFF = (orgId: string, restId: string) => `/owner/organization/${orgId}/restaurant/${restId}/staff`
	PRODUCT_CREATE = (orgId: string, restId: string) => `/owner/organization/${orgId}/restaurant/${restId}/menu/create`
}

export const OWNER_PAGES = new OwnerPages()
