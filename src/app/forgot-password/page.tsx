"use client"

import * as React from "react"
import { AuthLayout } from "@/components/auth/AuthLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = React.useState(false)
    const [isSubmitted, setIsSubmitted] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)
    const supabase = createClient()

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)
        setError(null)

        const formData = new FormData(event.currentTarget)
        const email = formData.get("email") as string

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
        })

        if (error) {
            setError(error.message)
            setIsLoading(false)
            return
        }

        setIsLoading(false)
        setIsSubmitted(true)
    }

    if (isSubmitted) {
        return (
            <AuthLayout>
                <div className="w-full text-center">
                    <h1 className="text-2xl font-semibold text-gray-900 mb-4">E-mail enviado!</h1>
                    <p className="text-sm text-gray-500 mb-8">
                        Enviamos um link de recuperação para o seu e-mail. Por favor, verifique sua caixa de entrada.
                    </p>
                    <Link href="/login">
                        <Button className="w-full h-12 bg-[#0056D2] hover:bg-blue-700 text-white font-semibold rounded-xl">
                            Voltar para o login
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
                    Insira seu email de recuperação
                </p>
            </div>

            <form onSubmit={onSubmit} className="w-full space-y-6">
                <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-medium text-gray-500 ml-1">
                        E-mail
                    </Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Informe seu e-mail"
                        required
                        className="h-12 bg-gray-50 border-gray-200 rounded-xl focus:ring-blue-600"
                    />
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
                            Enviando...
                        </>
                    ) : (
                        "Enviar email"
                    )}
                </Button>
            </form>

            <div className="mt-8 text-center">
                <Link
                    href="/login"
                    className="text-xs font-semibold text-blue-600 hover:underline flex items-center justify-center gap-2"
                >
                    Voltar
                </Link>
            </div>
        </AuthLayout >
    )
}
