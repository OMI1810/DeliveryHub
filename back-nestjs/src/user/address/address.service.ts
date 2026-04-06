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
    return this.prisma.addressUser.findMany({
      where: { userId },
      include: { address: true },
      orderBy: { address: { address: "asc" } },
    });
  }

  async getById(id: string, userId: string) {
    const relation = await this.prisma.addressUser.findUnique({
      where: { userId_addressId: { userId, addressId: id } },
      include: { address: true },
    });

    if (!relation) {
      throw new NotFoundException("Адрес не найден");
    }

    return relation.address;
  }

  async create(userId: string, dto: CreateAddressDto) {
    let lat: number;
    let lon: number;

    // Если переданы прямые координаты (с карты) — используем их
    if (dto.lat !== undefined && dto.lon !== undefined) {
      lat = dto.lat;
      lon = dto.lon;
    } else {
      // Иначе геокодируем адрес
      const geoResult = await this.geocodeAddress(dto);
      lat = geoResult.lat;
      lon = geoResult.lon;
    }

    const address = await this.prisma.address.create({
      data: {
        address: dto.address,
        entrance: dto.entrance ? Number(dto.entrance) : null,
        doorphone: dto.doorphone,
        flat: dto.flat,
        floor: dto.floor,
        comment: dto.comment,
        coordinateY: lat,
        coordinateX: lon,
        addressUser: {
          create: { userId },
        },
      },
      include: { addressUser: true },
    });

    return address;
  }

  async update(id: string, userId: string, dto: UpdateAddressDto) {
    await this.getById(id, userId);

    const updateData: Record<string, unknown> = {};

    if (dto.address !== undefined) updateData.address = dto.address;
    if (dto.entrance !== undefined)
      updateData.entrance = dto.entrance ? Number(dto.entrance) : null;
    if (dto.doorphone !== undefined) updateData.doorphone = dto.doorphone;
    if (dto.flat !== undefined) updateData.flat = dto.flat;
    if (dto.floor !== undefined) updateData.floor = dto.floor;
    if (dto.comment !== undefined) updateData.comment = dto.comment;

    // Если переданы данные для геокодирования — обновляем координаты
    if (dto.city || dto.country || dto.postalcode) {
      const fullAddress =
        `${dto.country || ""}, ${dto.city || ""}, ${dto.address || ""}, ${dto.postalcode || ""}`.trim();
      if (fullAddress.length > 0) {
        const { lat, lon } =
          await this.geocoodingService.geocodeOSM(fullAddress);
        updateData.coordinateY = lat;
        updateData.coordinateX = lon;
      }
    }

    return this.prisma.address.update({
      where: { idAddress: id },
      data: updateData,
    });
  }

  async remove(id: string, userId: string) {
    await this.getById(id, userId);

    // Удаляем связь, затем адрес (каскад)
    await this.prisma.addressUser.delete({
      where: { userId_addressId: { userId, addressId: id } },
    });

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
