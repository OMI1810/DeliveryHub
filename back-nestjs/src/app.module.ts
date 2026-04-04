import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { UserModule } from "./user/user.module";
import { GeocoodingModule } from "./geocooding/geocooding.module";
import { OrderModule } from "./order/order.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    UserModule,
    GeocoodingModule,
    OrderModule,
  ],
})
export class AppModule {}
