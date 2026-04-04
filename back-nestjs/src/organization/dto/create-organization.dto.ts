import { IsEmail, IsOptional, IsString, Matches } from 'class-validator'

export class CreateOrganizationDto {
	@IsString()
	name: string

	@IsEmail()
	email: string

	@IsOptional()
	@Matches(/^\+?\d{10,15}$/, { message: 'Invalid phone format. Expected: +79991234567' })
	phone?: string
}
