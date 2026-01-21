import { NextResponse } from 'next/server'
// The client you created from the Server-Side Auth instructions
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in search params, use it as the redirection URL
    const next = searchParams.get('next') ?? '/'

    if (code) {
        const supabase = await createClient()
        const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error && user) {
            // Check if it's the user's first access
            const { data: profile } = await supabase
                .from('users')
                .select('primeiroAcesso')
                .eq('id', user.id)
                .single()

            let targetPath = next
            if (profile?.primeiroAcesso) {
                targetPath = '/reset-password'
            }

            const forwardedHost = request.headers.get('x-forwarded-host')
            const isLocalEnv = process.env.NODE_ENV === 'development'

            if (isLocalEnv) {
                return NextResponse.redirect(`${origin}${targetPath}`)
            } else if (forwardedHost) {
                return NextResponse.redirect(`https://${forwardedHost}${targetPath}`)
            } else {
                return NextResponse.redirect(`${origin}${targetPath}`)
            }
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
