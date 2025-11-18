"use client"

import {
    CircleCheckIcon,
    InfoIcon,
    Loader2Icon,
    OctagonXIcon,
    TriangleAlertIcon,
} from "lucide-react"
import { Toaster as Sonner, ToasterProps } from "sonner"

// Custom Toaster component with glassy styling matching the yellowish color scheme
const Toaster = ({ ...props }: ToasterProps) => {
    return (
        <Sonner
            className="toaster group"
            icons={{
                success: <CircleCheckIcon className="size-4" />,
                info: <InfoIcon className="size-4" />,
                warning: <TriangleAlertIcon className="size-4" />,
                error: <OctagonXIcon className="size-4" />,
                loading: <Loader2Icon className="size-4 animate-spin" />,
            }}
            toastOptions={{
                // Glassy green for success
                classNames: {
                    success:
                        "bg-green-500/20 backdrop-blur-md border-green-400/30 text-green-900 dark:text-green-100",
                    error:
                        "bg-red-500/20 backdrop-blur-md border-red-400/30 text-red-900 dark:text-red-100",
                    warning:
                        "bg-yellow-500/20 backdrop-blur-md border-yellow-400/30 text-yellow-900 dark:text-yellow-100",
                    info: "bg-primary/20 backdrop-blur-md border-primary/30 text-foreground",
                },
            }}
            style={
                {
                    "--normal-bg": "var(--popover)",
                    "--normal-text": "var(--popover-foreground)",
                    "--normal-border": "var(--border)",
                    "--border-radius": "var(--radius)",
                } as React.CSSProperties
            }
            {...props}
        />
    )
}

export { Toaster }

