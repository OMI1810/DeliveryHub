import { IsOptional, IsString, MinLength } from 'class-validator'

export class CreateRestaurantDto {
	@IsString()
	@MinLength(2, { message: 'Name must be at least 2 characters' })
	name: string

	@IsOptional()
	@IsString()
	description?: string

	@IsOptional()
	@IsString()
	cuisine?: string

	@IsString()
	timeOpened: string

	@IsString()
	timeClosed: string
}
