// Order status enum (matches backend Status enum)
export enum OrderStatus {
  CREATED = "CREATED",
  COOKING = "COOKING",
  COURIER_ACCEPTED = "COURIER_ACCEPTED",
  FROM_DELIVERYMAN = "FROM_DELIVERYMAN",
  DELIVERED = "DELIVERED",
}

// Human-readable status labels
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.CREATED]: "Создан",
  [OrderStatus.COOKING]: "Готовится",
  [OrderStatus.COURIER_ACCEPTED]: "Принят курьером",
  [OrderStatus.FROM_DELIVERYMAN]: "У курьера",
  [OrderStatus.DELIVERED]: "Доставлен",
};

// Status colors for UI
export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  [OrderStatus.CREATED]: "bg-blue-100 text-blue-800",
  [OrderStatus.COOKING]: "bg-yellow-100 text-yellow-800",
  [OrderStatus.COURIER_ACCEPTED]: "bg-orange-100 text-orange-800",
  [OrderStatus.FROM_DELIVERYMAN]: "bg-purple-100 text-purple-800",
  [OrderStatus.DELIVERED]: "bg-green-100 text-green-800",
};

// Product in order
export interface IOrderProduct {
  idOrderProduct: string;
  quantity: number;
  product: {
    idProduct: string;
    name: string;
    description: string | null;
    calories: number | null;
    timeCooking: number | null;
  };
}

// Address in order
export interface IOrderAddress {
  idAddress: string;
  address: string;
  entrance: number | null;
  doorphone: string | null;
  flat: string | null;
  floor: string | null;
  comment: string | null;
  cordinatY: number;
  cordinatX: number;
}

// Restaurant in order
export interface IOrderRestaurant {
  idRestaurant: string;
  name: string;
  description: string | null;
  cuisine: string | null;
  timeOpened: string;
  timeClosed: string;
}

// Full order interface
export interface IOrder {
  idOrder: string;
  payStatus: boolean;
  status: OrderStatus;
  weight: number | null;
  createAt: string;
  clientId: string;
  deliverymanId: string | null;
  restarauntId: string;
  addressId: string;
  products: IOrderProduct[];
  address: IOrderAddress;
  restaraunt: IOrderRestaurant;
}
