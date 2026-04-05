import type { Metadata } from "next";
import { WorkContent } from "./WorkContent";

export const metadata: Metadata = {
  title: "Работа | DeliveryHub",
};

export default function WorkPage() {
  return <WorkContent />;
}
