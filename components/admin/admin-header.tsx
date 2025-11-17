'use client'

import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { AdminSidebar } from './admin-sidebar'

interface AdminHeaderProps {
  title: string
  description?: string
}

export function AdminHeader({ title, description }: AdminHeaderProps) {
  const pathname = usePathname()

  // Get breadcrumb from pathname
  const getBreadcrumb = () => {
    const parts = pathname.split('/').filter(Boolean)
    if (parts.length <= 1) return null
    
    const breadcrumbs = parts.map((part, index) => {
      const href = '/' + parts.slice(0, index + 1).join('/')
      const label = part.charAt(0).toUpperCase() + part.slice(1)
      return { href, label }
    })
    
    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumb()

  return (
    <div className="mb-8">
      {breadcrumbs && (
        <nav className="mb-4 text-sm text-muted-foreground">
          <ol className="flex items-center gap-2">
            {breadcrumbs.map((crumb, index) => (
              <li key={crumb.href} className="flex items-center gap-2">
                {index > 0 && <span>/</span>}
                <a
                  href={crumb.href}
                  className={index === breadcrumbs.length - 1 ? 'text-foreground font-medium' : 'hover:text-foreground'}
                >
                  {crumb.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      )}
      <div>
        <h1 className="text-3xl font-bold mb-2">{title}</h1>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  )
}

