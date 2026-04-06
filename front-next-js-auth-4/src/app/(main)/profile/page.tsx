import type { Metadata } from "next";
import { ProfileInfo } from "./ProfileInfo";
import { AddressList } from "@/components/ui/address/AddressList";

export const metadata: Metadata = {
  title: "Профиль | DeliveryHub",
};

export default function Page() {
  return (
    <div className="space-y-6">
      <ProfileInfo />
      <div>
        <h2 className="text-lg font-bold mb-3">📍 Адреса доставки</h2>
        <AddressList />
      </div>
    </div>
  );
}
