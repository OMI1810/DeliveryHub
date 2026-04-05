import type { Metadata } from "next";
import { RestaurantsCatalog } from "./RestaurantsCatalog";

export const metadata: Metadata = {
  title: "Рестораны | DeliveryHub",
};

export default function RestaurantsPage() {
  return <RestaurantsCatalog />;
}
