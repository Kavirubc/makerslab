'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  BarChart3,
  Users,
  FolderKanban,
  Building2,
  Flag,
  Menu,
  X,
} from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Projects', href: '/admin/projects', icon: FolderKanban },
  { name: 'Reports', href: '/admin/reports', icon: Flag },
  { name: 'Universities', href: '/admin/universities', icon: Building2 },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [pendingReportsCount, setPendingReportsCount] = useState<number | null>(null)

  // Fetch unresolved reports count (pending + reviewed, not resolved/dismissed)
  useEffect(() => {
    const fetchUnresolvedCount = async () => {
      try {
        // Fetch pending and reviewed separately and sum them
        const [pendingRes, reviewedRes] = await Promise.all([
          fetch('/api/admin/reports?status=pending&limit=1'),
          fetch('/api/admin/reports?status=reviewed&limit=1')
        ])
        
        let total = 0
        if (pendingRes.ok) {
          const pendingData = await pendingRes.json()
          total += pendingData.pagination?.total || 0
        }
        if (reviewedRes.ok) {
          const reviewedData = await reviewedRes.json()
          total += reviewedData.pagination?.total || 0
        }
        
        setPendingReportsCount(total)
      } catch (error) {
        console.error('Error fetching unresolved reports count:', error)
      }
    }
    fetchUnresolvedCount()
  }, [])

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b px-6">
        <h2 className="text-lg font-semibold">Admin Panel</h2>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/admin' && pathname.startsWith(item.href))
          const showBadge = item.name === 'Reports' && pendingReportsCount !== null && pendingReportsCount > 0
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className="h-5 w-5" />
                {item.name}
              </div>
              {showBadge && (
                <Badge variant="destructive" className="h-5 min-w-5 px-1.5 text-xs">
                  {pendingReportsCount > 99 ? '99+' : pendingReportsCount}
                </Badge>
              )}
            </Link>
          )
        })}
      </nav>
    </div>
  )

  return (
    <>
      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden fixed left-4 top-24 z-40">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          {sidebarContent}
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r bg-background px-6 pb-4">
          {sidebarContent}
        </div>
      </aside>
    </>
  )
}

