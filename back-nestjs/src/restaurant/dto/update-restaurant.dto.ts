import { IsOptional, IsString, MinLength, Matches } from 'class-validator'

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
	@Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'Invalid time format. Use HH:MM (00:00 — 23:59)' })
	timeOpened?: string

	@IsOptional()
	@IsString()
	@Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'Invalid time format. Use HH:MM (00:00 — 23:59)' })
	timeClosed?: string
}
