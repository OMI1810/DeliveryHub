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

	// Поля для геокодирования
	@IsString()
	@IsNotEmpty()
	city: string

	@IsString()
	@IsNotEmpty()
	country: string

	@IsString()
	@IsNotEmpty()
	postalcode: string
}
