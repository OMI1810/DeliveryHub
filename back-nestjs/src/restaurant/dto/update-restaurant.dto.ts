import { IsOptional, IsString, MinLength } from 'class-validator'

export class UpdateRestaurantDto {
	@IsOptional()
	@IsString()
	@MinLength(2, { message: 'Name must be at least 2 characters' })
	name?: string

	@IsOptional()
	@IsString()
	cuisine?: string

	@IsOptional()
	@IsString()
	timeOpened?: string

	@IsOptional()
	@IsString()
	timeClosed?: string
}
