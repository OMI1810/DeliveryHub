export interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
}

export interface Cart {
  restaurantId: string
  restaurantName: string
  items: CartItem[]
}

export type CartStorage = Record<string, Cart>
