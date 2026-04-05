import { Auth } from "@/auth/decorators/auth.decorator";
import { CurrentUser } from "@/auth/decorators/user.decorator";
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { CreateOrganizationDto } from "./dto/create-organization.dto";
import { UpdateOrganizationDto } from "./dto/update-organization.dto";
import { OrganizationService } from "./organization.service";

@Controller()
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) { }

  @Auth()
  @Get("owner/init")
  async getOwnerInit(@CurrentUser("idUser") userId: string) {
    return this.organizationService.getInit(userId);
  }

  @UsePipes(new ValidationPipe())
  @Auth()
  @Post("organizations")
  async createOrganization(
    @CurrentUser("idUser") userId: string,
    @Body() dto: CreateOrganizationDto,
  ) {
    return this.organizationService.create(userId, dto);
  }

  @Auth()
  @Get("organizations/:id")
  async getOrganization(
    @Param("id") id: string,
    @CurrentUser("idUser") userId: string,
  ) {
    return this.organizationService.getById(id, userId);
  }

  @UsePipes(new ValidationPipe())
  @Auth()
  @Patch("organizations/:id")
  async updateOrganization(
    @Param("id") id: string,
    @CurrentUser("idUser") userId: string,
    @Body() dto: UpdateOrganizationDto,
  ) {
    return this.organizationService.update(userId, id, dto);
  }

  @HttpCode(200)
  @Auth()
  @Delete("organizations/:id")
  async removeOrganization(
    @Param("id") id: string,
    @CurrentUser("idUser") userId: string,
  ) {
    return this.organizationService.remove(userId, id);
  }
}
