import { IsEmail } from 'class-validator'

export class AssignCashierDto {
	@IsEmail()
	email: string
}
