import { GeocoodingService } from "@/geocooding/geocooding.service";
import { PrismaService } from "@/prisma.service";
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateAddressDto } from "./dto/create-address.dto";
import { UpdateAddressDto } from "./dto/update-address.dto";

@Injectable()
export class AddressService {
  constructor(
    private prisma: PrismaService,
    private geocoodingService: GeocoodingService,
  ) {}

  async getAllByUserId(userId: string) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: { address: "asc" },
    });
  }

  async getById(id: string, userId: string) {
    const address = await this.prisma.address.findUnique({
      where: { idAddress: id },
    });

    if (!address) {
      throw new NotFoundException("Адрес не найден");
    }

    if (address.userId !== userId) {
      throw new ForbiddenException("Доступ запрещён");
    }

    return address;
  }

  async create(userId: string, dto: CreateAddressDto) {
    const { lat, lon } = await this.geocodeAddress(dto);

    return this.prisma.address.create({
      data: {
        address: dto.address,
        entrance: dto.entrance ? Number(dto.entrance) : null,
        doorphone: dto.doorphone,
        flat: dto.flat,
        floor: dto.floor,
        comment: dto.comment,
        cordinatY: lat,
        cordinatX: lon,
        userId,
      },
    });
  }

  async update(id: string, userId: string, dto: UpdateAddressDto) {
    await this.getById(id, userId);

    const updateData: Record<string, unknown> = { ...dto };

    // Если переданы данные для геокодирования — обновляем координаты
    if (dto.city || dto.country || dto.postalcode) {
      const fullAddress =
        `${dto.country || ""}, ${dto.city || ""}, ${dto.address || ""}, ${dto.postalcode || ""}`.trim();
      if (fullAddress.length > 0) {
        const { lat, lon } =
          await this.geocoodingService.geocodeOSM(fullAddress);
        updateData.cordinatY = lat;
        updateData.cordinatX = lon;
      }
    }

    if (dto.entrance) updateData.entrance = Number(dto.entrance);

    return this.prisma.address.update({
      where: { idAddress: id },
      data: updateData,
    });
  }

  async remove(id: string, userId: string) {
    await this.getById(id, userId);

    return this.prisma.address.delete({
      where: { idAddress: id },
    });
  }

  private async geocodeAddress(dto: CreateAddressDto) {
    const query = `${dto.country}, ${dto.city}, ${dto.address}, ${dto.postalcode}`;

    try {
      return await this.geocoodingService.geocodeOSM(query);
    } catch {
      throw new BadRequestException("Не удалось определить координаты адреса");
    }
  }
}
