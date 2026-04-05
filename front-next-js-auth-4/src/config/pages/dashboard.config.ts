class DashboardPages {
  HOME = "/";
  PROFILE = "/profile";
  ADDRESSES = "/profile/addresses";
  CART = "/cart";
  ORDERS = "/orders";
  WORK = "/work";
  RESTAURANTS = "/restaurants";
  RESTAURANT_MENU = (id: string) => `/restaurant/${id}`;
}

export const DASHBOARD_PAGES = new DashboardPages();
