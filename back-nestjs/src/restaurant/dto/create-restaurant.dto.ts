import { IsNotEmpty, IsNumber, IsOptional, IsString, MinLength } from 'class-validator'

export class CreateRestaurantDto {
	@IsString()
	@MinLength(2, { message: 'Name must be at least 2 characters' })
	@IsNotEmpty()
	name: string

	@IsOptional()
	@IsString()
	description?: string

	@IsOptional()
	@IsString()
	cuisine?: string

	@IsString()
	@IsNotEmpty({ message: 'Opening time is required (HH:MM)' })
	timeOpened: string

	@IsString()
	@IsNotEmpty({ message: 'Closing time is required (HH:MM)' })
	timeClosed: string

	// Адрес ресторана (обязательный)
	@IsString()
	@IsNotEmpty({ message: 'Address is required' })
	address: string

	@IsOptional()
	@IsString()
	floor?: string

	@IsOptional()
	@IsString()
	comment?: string

	// Координаты (с карты или геокодирования)
	@IsOptional()
	@IsNumber()
	lat?: number

	@IsOptional()
	@IsNumber()
	lon?: number
}
