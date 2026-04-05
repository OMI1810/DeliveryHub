import type { Metadata } from "next";
import { CashierContent } from "./CashierContent";

export const metadata: Metadata = {
  title: "Касса | DeliveryHub",
};

export default function CashierPage() {
  return <CashierContent />;
}
