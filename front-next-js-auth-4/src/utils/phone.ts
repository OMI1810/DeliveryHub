/**
 * Форматирует телефонный номер в читаемый вид: +7 999 123 45 67
 * Принимает строку с любыми символами, оставляет только + и цифры
 */
export function formatPhone(input: string): string {
	const cleaned = input.replace(/[^\d+]/g, '')
	if (!cleaned) return ''

	// Оставляем только + в начале и цифры
	const hasPlus = cleaned.startsWith('+')
	const digits = cleaned.replace(/\D/g, '')

	if (!digits) return hasPlus ? '+' : ''

	// Для российских номеров (11 цифр, начиная с 7 или 8)
	if (digits.length === 11 && (digits[0] === '7' || digits[0] === '8')) {
		const formatted = `+7 ${digits.slice(1, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 9)} ${digits.slice(9, 11)}`
		return formatted.trim()
	}

	// Общий формат: +<код страны> <номер>
	if (hasPlus && digits.length > 3) {
		const codeLen = digits.length <= 10 ? 1 : digits.length <= 12 ? 2 : 3
		const code = digits.slice(0, codeLen)
		const rest = digits.slice(codeLen)

		// Разбиваем оставшуюся часть по 2-3 символа
		const groups = rest.match(/.{1,3}/g)
		if (groups) {
			return `+${code} ${groups.join(' ')}`
		}
	}

	// Фоллбэк — просто возвращаем как есть с +
	return hasPlus ? `+${digits}` : digits
}

/**
 * Валидирует телефонный номер
 * Допускает: +79991234567, 89991234567, +1234567890, и т.д.
 * Минимум 10 цифр, максимум 15
 */
export function validatePhone(phone: string): boolean {
	if (!phone) return true // пустое значение допустимо (опциональное поле)
	const digits = phone.replace(/\D/g, '')
	return digits.length >= 10 && digits.length <= 15
}

/**
 * Очищает телефон от всех символов кроме + и цифр (для отправки на бэкенд)
 */
export function cleanPhone(input: string): string {
	return input.replace(/[^\d+]/g, '').replace(/(\d)\+(\d)/, '$1$2')
}
