'use client'

import { Award } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface ContributorBadgeProps {
    contributorType: 'contributor' | 'core-contributor'
    className?: string
    showIcon?: boolean
}

/**
 * Contributor badge component with glassy styling
 * - Core contributors: glassy yellow with border
 * - Regular contributors: glassy transparent with border
 * - Hover shows tooltip with info and link to GitHub
 * - Click redirects to GitHub repository
 */
export function ContributorBadge({
    contributorType,
    className,
    showIcon = true
}: ContributorBadgeProps) {
    const isCore = contributorType === 'core-contributor'

    return (
        <div className="relative group inline-block">
            <Link
                href="https://github.com/Kavirubc/ucsc-project-share"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
            >
                <div
                    className={cn(
                        'inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs font-medium w-fit whitespace-nowrap shrink-0 gap-1.5 cursor-pointer transition-all duration-200',
                        // Core contributor: glassy yellow with border
                        isCore &&
                        'bg-yellow-500/20 dark:bg-yellow-500/15 backdrop-blur-md border-yellow-500/60 dark:border-yellow-400/50 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-500/30 dark:hover:bg-yellow-500/25 hover:border-yellow-500/80 dark:hover:border-yellow-400/70 hover:shadow-lg hover:shadow-yellow-500/30 dark:hover:shadow-yellow-400/20',
                        // Regular contributor: glassy ash/gray with border
                        !isCore &&
                        'bg-gray-400/25 dark:bg-gray-500/20 backdrop-blur-md border-gray-400/50 dark:border-gray-400/40 text-gray-700 dark:text-gray-300 hover:bg-gray-400/35 dark:hover:bg-gray-500/30 hover:border-gray-400/70 dark:hover:border-gray-400/60 hover:shadow-lg hover:shadow-gray-400/20 dark:hover:shadow-gray-500/15',
                        className
                    )}
                >
                    {showIcon && <Award className="h-3 w-3" />}
                    <span>{isCore ? 'Core Contributor' : 'Contributor'}</span>
                </div>
            </Link>

            {/* Custom tooltip - appears on hover */}
            <div
                className={cn(
                    'absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-4 py-3 rounded-lg text-xs',
                    'bg-popover/95 dark:bg-popover/95 backdrop-blur-sm',
                    'border border-border shadow-xl',
                    'pointer-events-none opacity-0 invisible',
                    'group-hover:opacity-100 group-hover:visible',
                    'transition-all duration-200 z-50',
                    'whitespace-normal w-[280px] text-center',
                    'before:content-[""] before:absolute before:top-full before:left-1/2 before:-translate-x-1/2',
                    'before:border-4 before:border-transparent before:border-t-popover/95',
                    'before:dark:border-t-popover/95'
                )}
            >
                <div className="font-semibold mb-1.5">
                    {isCore ? 'Core Contributor' : 'Contributor'}
                </div>
                <div className="text-muted-foreground text-[10px] leading-relaxed mb-1">
                    {isCore
                        ? 'This is a core contributor to this platform.'
                        : 'This is a contributor to this platform.'}
                </div>
                <div className="text-muted-foreground text-[10px] leading-relaxed font-medium">
                    Click to learn how to become a contributor.
                </div>
            </div>
        </div>
    )
}

