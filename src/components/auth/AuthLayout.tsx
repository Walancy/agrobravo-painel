import Image from "next/image"
import React from "react"

interface AuthLayoutProps {
    children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div className="min-h-screen w-full bg-[#E9ECEF] flex items-center justify-center p-4 font-sans">
            <div className="w-full max-w-[440px] bg-white rounded-[32px] shadow-sm p-8 md:p-12 flex flex-col items-center">
                <div className="mb-8">
                    <Image
                        src="/logo_agrobravo.svg"
                        alt="AgroBravo Enterprise"
                        width={200}
                        height={60}
                        className="h-auto"
                        priority
                    />
                </div>
                {children}
            </div>
        </div>
    )
}
