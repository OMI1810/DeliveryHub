import { IsOptional, IsString } from 'class-validator'

export class UpdateAddressDto {
	@IsOptional()
	@IsString()
	address?: string

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

	// Поля для геокодирования (опциональны при обновлении)
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
