import { IsInt, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator'

export class CreateProductDto {
	@IsString()
	@MinLength(2, { message: 'Name must be at least 2 characters' })
	name: string

	@IsNumber()
	@Min(0.01, { message: 'Price must be greater than 0' })
	price: number

	@IsOptional()
	@IsString()
	description?: string

	@IsOptional()
	@IsNumber()
	@Min(0, { message: 'Calories cannot be negative' })
	calories?: number

	@IsOptional()
	@IsInt()
	@Min(0, { message: 'Cooking time cannot be negative' })
	timeCooking?: number
}
