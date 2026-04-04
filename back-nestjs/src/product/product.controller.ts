import { Auth } from '@/auth/decorators/auth.decorator'
import { CurrentUser } from '@/auth/decorators/user.decorator'
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
	ValidationPipe
} from '@nestjs/common'
import { CreateProductDto } from './dto/create-product.dto'
import { UpdateProductDto } from './dto/update-product.dto'
import { ProductService } from './product.service'

@Controller('organizations/:orgId/restaurants/:restId/products')
export class ProductController {
	constructor(private readonly productService: ProductService) {}

	@Auth()
	@Get()
	async getProducts(
		@Param('orgId') orgId: string,
		@Param('restId') restId: string,
		@CurrentUser('idUser') userId: string
	) {
		return this.productService.getByRestaurant(orgId, restId, userId)
	}

	@Auth()
	@Get(':id')
	async getProduct(
		@Param('orgId') orgId: string,
		@Param('restId') restId: string,
		@Param('id') id: string,
		@CurrentUser('idUser') userId: string
	) {
		return this.productService.getById(orgId, restId, id, userId)
	}

	@UsePipes(new ValidationPipe())
	@HttpCode(201)
	@Auth()
	@Post()
	async createProduct(
		@Param('orgId') orgId: string,
		@Param('restId') restId: string,
		@CurrentUser('idUser') userId: string,
		@Body() dto: CreateProductDto
	) {
		return this.productService.create(orgId, restId, userId, dto)
	}

	@UsePipes(new ValidationPipe())
	@Auth()
	@Patch(':id')
	async updateProduct(
		@Param('orgId') orgId: string,
		@Param('restId') restId: string,
		@Param('id') id: string,
		@CurrentUser('idUser') userId: string,
		@Body() dto: UpdateProductDto
	) {
		return this.productService.update(orgId, restId, id, userId, dto)
	}

	@HttpCode(200)
	@Auth()
	@Delete(':id')
	async removeProduct(
		@Param('orgId') orgId: string,
		@Param('restId') restId: string,
		@Param('id') id: string,
		@CurrentUser('idUser') userId: string
	) {
		return this.productService.remove(orgId, restId, id, userId)
	}
}
