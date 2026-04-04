import { ADMIN_PAGES } from "@/config/pages/admin.config";
import { DASHBOARD_PAGES } from "@/config/pages/dashboard.config";
import { OWNER_PAGES } from "@/config/pages/owner.config";
import { PUBLIC_PAGES } from "@/config/pages/public.config";
import Link from "next/link";
import { AddToCartButton } from "@/components/ui/AddToCartButton";

const pages = [
  PUBLIC_PAGES.LOGIN,
  DASHBOARD_PAGES.PROFILE,
  DASHBOARD_PAGES.ADDRESSES,
  DASHBOARD_PAGES.CART,
  DASHBOARD_PAGES.ORDERS,
  DASHBOARD_PAGES.WORK,
  ADMIN_PAGES.HOME,
  ADMIN_PAGES.MANAGER,
  OWNER_PAGES.HOME,
];

export default function Home() {
  return (
    <div>
      <h1 className="mt-4">Home Page</h1>
      <br />
      <p>Для проверки, есть страницы:</p>
      <br />
      <ul className="space-y-2">
        {pages.map((page) => (
          <li key={page}>
            <Link className="text-primary hover:underline" href={page}>
              {page}
            </Link>
          </li>
        ))}
      </ul>

      <br />
      <hr className="my-6" />
      <h2 className="text-xl font-bold">Тест корзины</h2>
      <br />
      <div className="space-y-3">
        <AddToCartButton
          productId="cmnkp7voi0004u9coapkg81kb"
          productName="Маргарита"
          productPrice={500}
          restaurantId="cmnkp7voh0003u9coovseeccj"
          restaurantName="Пиццерия"
        />
        <AddToCartButton
          productId="cmnkp7voi0005u9co8l6hurdy"
          productName="Пепперони"
          productPrice={600}
          restaurantId="cmnkp7voh0003u9coovseeccj"
          restaurantName="Пиццерия"
        />
        <AddToCartButton
          productId="cmnkp7vor0009u9cocnu5oz2e"
          productName="Филадельфия"
          productPrice={800}
          restaurantId="cmnkp7voq0008u9coe67hraes"
          restaurantName="Суши-бар"
        />
      </div>
    </div>
  );
}
