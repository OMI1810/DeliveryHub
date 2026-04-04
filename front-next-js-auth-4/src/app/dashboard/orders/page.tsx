import { OrderList } from "./OrderList";

export default function OrdersPage() {
  return (
    <div className="w-full max-w-4xl mx-auto mt-10">
      <h1 className="text-3xl font-bold text-white mb-8">Мои заказы</h1>
      <OrderList />
    </div>
  );
}
