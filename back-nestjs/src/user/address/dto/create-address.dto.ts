import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'

export class CreateAddressDto {
	@IsString()
	@IsNotEmpty()
	address: string

	@IsOptional()
	@IsString()
	entrance?: string

	@IsOptional()
	@IsString()
	doorphone?: string

	@IsOptional()
	@IsString()
	flat?: string

	@IsOptional()
	@IsString()
	floor?: string

	@IsOptional()
	@IsString()
	comment?: string

	// Прямые координаты (с карты)
	@IsOptional()
	@IsNumber()
	lat?: number

	@IsOptional()
	@IsNumber()
	lon?: number

	// Поля для геокодирования (если нет прямых координат)
	@IsOptional()
	@IsString()
	city?: string

	@IsOptional()
	@IsString()
	country?: string

	@IsOptional()
	@IsString()
	postalcode?: string
}
