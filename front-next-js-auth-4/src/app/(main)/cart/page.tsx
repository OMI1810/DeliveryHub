import type { Metadata } from "next";
import { CartPage } from "./CartPage";

export const metadata: Metadata = {
  title: "Корзина | DeliveryHub",
};

export default function Page() {
  return <CartPage />;
}
