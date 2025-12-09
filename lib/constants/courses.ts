// Team size options
export const TEAM_SIZE_OPTIONS = [
  { value: 'individual', label: 'Individual' },
  { value: 'group', label: 'Group' },
] as const

// Academic type options
export const ACADEMIC_TYPE_OPTIONS = [
  { value: 'assignment', label: 'Assignment' },
  { value: 'capstone', label: 'Capstone Project' },
  { value: 'thesis', label: 'Thesis' },
  { value: 'research', label: 'Research Project' },
  { value: 'other', label: 'Other' },
] as const

// Generate academic periods dynamically (current year + past years)
export function generateAcademicPeriods(yearsBack: number = 5): string[] {
  const periods: string[] = []
  const currentYear = new Date().getFullYear()

  for (let i = 0; i <= yearsBack; i++) {
    const year = currentYear - i
    periods.push(`${year}/${year + 1} Semester 1`)
    periods.push(`${year}/${year + 1} Semester 2`)
  }

  return periods
}
