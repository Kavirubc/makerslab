import Link from "next/link";

export function Footer() {
    return (
        <footer className="border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 mt-8 py-6 w-full">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
                <div className="flex flex-col items-center gap-2">
                    <p>&copy; {new Date().getFullYear()} Showcase.lk. All rights reserved.</p>
                    <Link 
                        href="/contributors" 
                        className="text-sm hover:text-foreground transition-colors underline underline-offset-4"
                    >
                        View Contributors
                    </Link>
                </div>
            </div>
        </footer>
    );
}
