import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { UserModule } from "./user/user.module";
import { GeocoodingModule } from "./geocooding/geocooding.module";

import { OrganizationModule } from "./organization/organization.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    UserModule,
    GeocoodingModule,
    OrganizationModule,
  ],
})
export class AppModule {}
