import type { Metadata } from "next";
import { OrderList } from "./OrderList";

export const metadata: Metadata = {
  title: "Заказы | DeliveryHub",
};

export default function OrdersPage() {
  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Мои заказы</h1>
      <OrderList />
    </div>
  );
}
