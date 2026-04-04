import type { Metadata } from 'next'
import { WorkContent } from './WorkContent'

export const metadata: Metadata = {
	title: 'Work'
}

export default function WorkPage() {
	return <WorkContent />
}
