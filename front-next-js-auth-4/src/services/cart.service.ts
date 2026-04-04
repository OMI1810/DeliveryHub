import { Cart, CartItem, CartStorage } from '@/types/cart.types'

const STORAGE_KEY = 'delivery_cart'

class CartService {
  private getStorage(): CartStorage {
    if (typeof window === 'undefined') return {}
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : {}
  }

  private setStorage(storage: CartStorage): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storage))
  }

  /** Получить все корзины */
  getCarts(): Cart[] {
    const storage = this.getStorage()
    return Object.values(storage)
  }

  /** Получить корзину ресторана */
  getCartByRestaurant(restaurantId: string): Cart | undefined {
    return this.getStorage()[restaurantId]
  }

  /** Добавить товар в корзину */
  addToCart(
    item: Omit<CartItem, 'quantity'>,
    restaurantId: string,
    restaurantName: string,
    quantity: number = 1
  ): Cart {
    const storage = this.getStorage()
    let cart = storage[restaurantId]

    if (!cart) {
      cart = { restaurantId, restaurantName, items: [] }
    }

    const existingItem = cart.items.find(i => i.productId === item.productId)

    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      cart.items.push({ ...item, quantity })
    }

    storage[restaurantId] = cart
    this.setStorage(storage)
    return cart
  }

  /** Обновить количество */
  updateQuantity(restaurantId: string, productId: string, quantity: number): Cart {
    const storage = this.getStorage()
    const cart = storage[restaurantId]

    if (!cart) throw new Error('Корзина не найдена')

    const item = cart.items.find(i => i.productId === productId)
    if (!item) throw new Error('Товар не найден')

    if (quantity <= 0) {
      return this.removeFromCart(restaurantId, productId)
    }

    item.quantity = quantity
    storage[restaurantId] = cart
    this.setStorage(storage)
    return cart
  }

  /** Удалить товар */
  removeFromCart(restaurantId: string, productId: string): Cart {
    const storage = this.getStorage()
    const cart = storage[restaurantId]

    if (!cart) throw new Error('Корзина не найдена')

    cart.items = cart.items.filter(i => i.productId !== productId)

    if (cart.items.length === 0) {
      delete storage[restaurantId]
    } else {
      storage[restaurantId] = cart
    }

    this.setStorage(storage)
    return cart
  }

  /** Очистить корзину ресторана */
  clearCart(restaurantId: string): void {
    const storage = this.getStorage()
    delete storage[restaurantId]
    this.setStorage(storage)
  }

  /** Очистить все корзины */
  clearAll(): void {
    localStorage.removeItem(STORAGE_KEY)
  }

  /** Общее количество товаров */
  getTotalItems(): number {
    const carts = this.getCarts()
    return carts.reduce((sum, cart) => sum + cart.items.reduce((s, i) => s + i.quantity, 0), 0)
  }

  /** Итого по корзине ресторана */
  getCartTotal(restaurantId: string): number {
    const cart = this.getCartByRestaurant(restaurantId)
    if (!cart) return 0
    return cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }

  /** Форматирование цены */
  formatPrice(price: number): string {
    return price.toFixed(2)
  }
}

export default new CartService()
