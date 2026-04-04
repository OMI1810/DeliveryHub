class OwnerPages {
	HOME = '/owner'
	CREATE = '/owner/create'
	ORGANIZATION = (id: string) => `/owner/organization/${id}`
}

export const OWNER_PAGES = new OwnerPages()
