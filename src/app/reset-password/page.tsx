"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { AuthLayout } from "@/components/auth/AuthLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

export default function ResetPasswordPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = React.useState(false)
    const [isSuccess, setIsSuccess] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)
    const [showPassword, setShowPassword] = React.useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)
    const supabase = createClient()

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)
        setError(null)

        const formData = new FormData(event.currentTarget)
        const password = formData.get("password") as string
        const confirmPassword = formData.get("confirmPassword") as string

        if (password !== confirmPassword) {
            setError("As senhas não coincidem.")
            setIsLoading(false)
            return
        }

        const { error: updateError } = await supabase.auth.updateUser({
            password: password,
        })

        if (updateError) {
            setError(updateError.message)
            setIsLoading(false)
            return
        }

        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            await supabase
                .from('users')
                .update({ primeiroAcesso: false })
                .eq('id', user.id)
        }

        setIsLoading(false)
        setIsSuccess(true)
    }

    if (isSuccess) {
        return (
            <AuthLayout>
                <div className="w-full text-center">
                    <h1 className="text-2xl font-semibold text-gray-900 mb-2">Senha atualizada com sucesso!</h1>
                    <p className="text-sm text-gray-500 mb-8">
                        Parabéns! Sua senha foi alterada.
                    </p>
                    <Link href="/login">
                        <Button className="w-full h-12 bg-[#0056D2] hover:bg-blue-700 text-white font-semibold rounded-xl">
                            Fazer login
                        </Button>
                    </Link>
                </div>
            </AuthLayout>
        )
    }

    return (
        <AuthLayout>
            <div className="w-full text-center mb-8">
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">Recuperar acesso</h1>
                <p className="text-sm text-gray-500">
                    Crie uma nova senha. Certifique-se de que seja diferente das anteriores por questões de segurança.
                </p>
            </div>

            <form onSubmit={onSubmit} className="w-full space-y-4">
                <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-xs font-medium text-gray-500 ml-1">
                        Nova senha
                    </Label>
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
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword" className="text-xs font-medium text-gray-500 ml-1">
                        Confirmar nova senha
                    </Label>
                    <div className="relative">
                        <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Informe sua senha"
                            required
                            className="h-12 bg-gray-50 border-gray-200 rounded-xl focus:ring-blue-600 pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            {showConfirmPassword ? (
                                <EyeOff className="h-5 w-5" />
                            ) : (
                                <Eye className="h-5 w-5" />
                            )}
                        </button>
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
                            Salvando...
                        </>
                    ) : (
                        "Salvar"
                    )}
                </Button>
            </form>

            <div className="mt-8 text-center">
                <Link
                    href="/login"
                    className="text-xs font-semibold text-blue-600 hover:underline"
                >
                    Voltar
                </Link>
            </div>
        </AuthLayout>
    )
}
