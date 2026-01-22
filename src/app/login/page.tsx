"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { AuthLayout } from "@/components/auth/AuthLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Eye, EyeOff } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const supabase = createClient()
    const [isLoading, setIsLoading] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)

    const [showPassword, setShowPassword] = React.useState(false)

    React.useEffect(() => {
        const errorDescription = searchParams.get("error_description")
        const errorCode = searchParams.get("error_code")

        if (errorDescription) {
            // Decodifica a URL para ler a mensagem corretamente
            const decodedError = decodeURIComponent(errorDescription.replace(/\+/g, " "))

            if (errorCode === "otp_expired") {
                setError("O link de recuperação expirou ou já foi utilizado. Por favor, solicite um novo.")
            } else {
                setError(decodedError)
            }
        }
    }, [searchParams])

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)
        setError(null)

        const formData = new FormData(event.currentTarget)
        const email = formData.get("email") as string
        const password = formData.get("password") as string

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            setError("E-mail ou senha incorretos.")
            setIsLoading(false)
            return
        }

        router.push("/")
        router.refresh()
    }

    return (
        <AuthLayout>
            <div className="w-full text-center mb-8">
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">Acesse sua Conta</h1>
                <p className="text-sm text-gray-500">
                    Por favor, insira seu e-mail cadastrado para acessar o sistema.
                </p>
            </div>

            <form onSubmit={onSubmit} className="w-full space-y-4">
                <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-medium text-gray-500 ml-1">
                        E-mail
                    </Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Digite seu email"
                        required
                        className="h-12 bg-gray-50 border-gray-200 rounded-xl focus:ring-blue-600"
                    />
                </div>

                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="text-xs font-medium text-gray-500 ml-1">
                            Senha
                        </Label>
                    </div>
                    <div className="relative">
                        <Input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Informe sua senha"
                            required
                            className="h-12 bg-gray-50 border-gray-200 rounded-xl focus:ring-blue-600 pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            {showPassword ? (
                                <EyeOff className="h-5 w-5" />
                            ) : (
                                <Eye className="h-5 w-5" />
                            )}
                        </button>
                    </div>
                    <div className="flex justify-end mt-1">
                        <Link
                            href="/forgot-password"
                            className="text-[11px] font-semibold text-blue-600 hover:underline"
                        >
                            Esqueceu a senha?
                        </Link>
                    </div>
                </div>

                {error && (
                    <div className="text-xs text-red-500 text-center bg-red-50 py-2 rounded-lg border border-red-100">
                        {error}
                    </div>
                )}

                <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-[#0056D2] hover:bg-blue-700 text-white font-semibold rounded-xl transition-all"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Entrando...
                        </>
                    ) : (
                        "Entrar"
                    )}
                </Button>
            </form>

            <div className="mt-8 text-center">
                <p className="text-[11px] text-gray-500">
                    Não possui uma conta? <span className="font-semibold text-gray-900">Solicite acesso</span> com um gestor agrobravo.
                </p>
            </div>
        </AuthLayout>
    )
}
