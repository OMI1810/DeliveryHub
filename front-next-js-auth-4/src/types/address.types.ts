export interface IAddress {
  idAddress: string;
  address: string;
  entrance?: number | null;
  doorphone?: string | null;
  flat?: string | null;
  floor?: string | null;
  comment?: string | null;
  cordinatY: number;
  cordinatX: number;
}

export interface IAddressUser {
  userId: string;
  addressId: string;
  address: IAddress;
}

export interface ICreateAddressDto {
  address: string;
  entrance?: string;
  doorphone?: string;
  flat?: string;
  floor?: string;
  comment?: string;
  lat?: number;
  lon?: number;
}

export interface IUpdateAddressDto {
  address?: string;
  entrance?: string;
  doorphone?: string;
  flat?: string;
  floor?: string;
  comment?: string;
}
