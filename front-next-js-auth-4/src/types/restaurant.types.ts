export interface IRestaurant {
  idRestaurant: string;
  name: string;
  description?: string;
  cuisine?: string;
  timeOpened: string;
  timeClosed: string;
  organizationId: string;
  address?: {
    addressId: string;
    address: {
      idAddress: string;
      address: string;
      floor?: string;
      comment?: string;
      coordinateY: number;
      coordinateX: number;
    };
  };
}

export interface IRestaurantCreate {
  name: string;
  description?: string;
  cuisine?: string;
  timeOpened: string;
  timeClosed: string;
  address: string;
  floor?: string;
  comment?: string;
  lat?: number;
  lon?: number;
}

export interface IRestaurantUpdate {
  name?: string;
  cuisine?: string;
  timeOpened?: string;
  timeClosed?: string;
}

export interface IPublicRestaurant {
  idRestaurant: string;
  name: string;
  description?: string;
  cuisine?: string;
  timeOpened: string;
  timeClosed: string;
  organizationId: string;
  organization: {
    idOrganization: string;
    name: string;
  };
  address?: {
    addressId: string;
    address: {
      address: string;
      coordinateX: number;
      coordinateY: number;
    };
  };
}
