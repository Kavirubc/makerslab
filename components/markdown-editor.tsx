'use client'

import dynamic from 'next/dynamic'
import { Label } from '@/components/ui/label'

const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false }
)

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
}

export function MarkdownEditor({
  value,
  onChange,
  label,
  placeholder = 'Write your content here... (Supports Markdown)',
  disabled = false,
  required = false
}: MarkdownEditorProps) {
  return (
    <div className="space-y-2">
      {label && (
        <Label>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      <div data-color-mode="light" className="dark:hidden">
        <MDEditor
          value={value}
          onChange={(val) => onChange(val || '')}
          preview="edit"
          height={300}
          textareaProps={{
            placeholder,
            disabled
          }}
        />
      </div>
      <div data-color-mode="dark" className="hidden dark:block">
        <MDEditor
          value={value}
          onChange={(val) => onChange(val || '')}
          preview="edit"
          height={300}
          textareaProps={{
            placeholder,
            disabled
          }}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Supports Markdown formatting: **bold**, *italic*, [links](url), bullet lists, and more
      </p>
    </div>
  )
}
