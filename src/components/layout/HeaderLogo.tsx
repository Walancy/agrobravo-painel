import Image from "next/image"

export function HeaderLogo() {
    return (
        <div className="flex items-center justify-center gap-2 w-[184px]">
            <Image
                src="/logo_agrobravo.svg"
                alt="AgroBravo Enterprise"
                width={140}
                height={35}
                className="h-auto"
                priority
            />
        </div>
    )
}
