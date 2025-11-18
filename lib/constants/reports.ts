// Predefined report reasons with labels
export const REPORT_REASONS = [
  {
    value: 'ip-violation',
    label: 'Intellectual Property Violation',
    description: 'Project violates intellectual property rights (e.g., stolen/copied work)'
  },
  {
    value: 'false-information',
    label: 'False Information',
    description: 'Project contains false or misleading information'
  },
  {
    value: 'inappropriate-content',
    label: 'Inappropriate Content',
    description: 'Project contains inappropriate, offensive, or harmful content'
  },
  {
    value: 'spam',
    label: 'Spam/Fake Project',
    description: 'Project appears to be spam or fake'
  },
  {
    value: 'other',
    label: 'Other',
    description: 'Other reason (please specify in description)'
  }
] as const

// Maximum number of evidence images allowed per report
export const MAX_EVIDENCE_IMAGES = 5

// Maximum image file size (5MB for evidence)
export const MAX_EVIDENCE_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB in bytes

// Report cooldown period in hours (prevents duplicate reports)
export const REPORT_COOLDOWN_HOURS = 24

// Get reason label by value
export function getReasonLabel(value: string): string {
  const reason = REPORT_REASONS.find(r => r.value === value)
  return reason?.label || value
}

