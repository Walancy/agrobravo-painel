import { HeaderLogo } from "@/components/layout/HeaderLogo"
import { HeaderNavigation } from "@/components/layout/HeaderNavigation"
import { HeaderProfile } from "@/components/layout/HeaderProfile"

export function Header() {
    return (
        <header className="h-16 border-b border-border/40 bg-white px-6 flex items-center justify-between sticky top-0 z-40 w-full">
            <div className="flex items-center gap-6">
                <HeaderLogo />
                <div className="h-6 w-px bg-border/60 mx-2 hidden md:block" />
                <HeaderNavigation />
            </div>
            <HeaderProfile />
        </header>
    )
}
