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
    const user = await this.prisma.user.findUnique({
      where: { idUser: userId },
    });

    if (!user) {
      throw new NotFoundException("Пользователь не найден");
    }

    const geo = await this.geocodeAddress(dto);

    return this.prisma.$transaction(async (tx) => {
      const address = await tx.address.create({
        data: {
          address: geo.displayName || dto.address,
          entrance: dto.entrance ? Number(dto.entrance) : null,
          doorphone: dto.doorphone,
          flat: dto.flat,
          floor: dto.floor,
          comment: dto.comment,
          cordinatY: geo.lat,
          cordinatX: geo.lon,
        },
      });

      await tx.addressUser.create({
        data: {
          userId,
          addressId: address.idAddress,
        },
      });

      return address;
    });
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
    const { lat, lon } = await this.geocoodingService.geocodeOSM(dto.address);
    updateData.cordinatY = lat;
    updateData.cordinatX = lon;

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
    // Если координаты переданы напрямую (клик по карте) — используем их
    if (dto.lat !== undefined && dto.lon !== undefined) {
      // Если адрес не указан — определяем по координатам
      if (!dto.address) {
        const geo = await this.geocoodingService.reverseGeocode(
          dto.lat,
          dto.lon,
        );
        return { lat: dto.lat, lon: dto.lon, displayName: geo.displayName };
      }
      return { lat: dto.lat, lon: dto.lon, displayName: dto.address };
    }
    // Иначе геокодируем адрес
    try {
      return await this.geocoodingService.geocodeOSM(dto.address);
    } catch {
      throw new BadRequestException("Не удалось определить координаты адреса");
    }
  }
}
