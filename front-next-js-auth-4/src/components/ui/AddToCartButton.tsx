'use client'
import { useCart } from '@/hooks/useCart'
import { useState } from 'react'
import { FiShoppingCart, FiCheck } from 'react-icons/fi'

interface Props {
  productId: string
  productName: string
  productPrice: number
  restaurantId: string
  restaurantName: string
}

export function AddToCartButton({
  productId,
  productName,
  productPrice,
  restaurantId,
  restaurantName
}: Props) {
  const { addToCart } = useCart()
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    addToCart(
      { productId, name: productName, price: productPrice },
      restaurantId,
      restaurantName,
      1
    )
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <button
      onClick={handleAdd}
      disabled={added}
      className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
        added
          ? 'bg-green-500 text-white'
          : 'bg-primary text-white hover:opacity-90'
      }`}
    >
      {added ? (
        <>
          <FiCheck /> Добавлено
        </>
      ) : (
        <>
          <FiShoppingCart /> В корзину
        </>
      )}
    </button>
  )
}
