import type { Metadata } from "next";
import { ProfileInfo } from "./ProfileInfo";

export const metadata: Metadata = {
  title: "Профиль | DeliveryHub",
};

export default function Page() {
  return <ProfileInfo />;
}
