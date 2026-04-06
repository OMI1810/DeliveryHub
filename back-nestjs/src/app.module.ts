import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { AuthModule } from "./auth/auth.module";
import { UserModule } from "./user/user.module";
import { GeocoodingModule } from "./geocooding/geocooding.module";
import { OrderModule } from "./order/order.module";
import { OrganizationModule } from "./organization/organization.module";
import { RestaurantModule } from "./restaurant/restaurant.module";
import { ProductModule } from "./product/product.module";
import { CashierModule } from "./cashier/cashier.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    AuthModule,
    UserModule,
    GeocoodingModule,
    OrganizationModule,
    OrderModule,
    RestaurantModule,
    ProductModule,
    CashierModule,
  ],
})
export class AppModule {}
