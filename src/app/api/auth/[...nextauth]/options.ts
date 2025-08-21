import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { randomBytes } from 'crypto'

export const options: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: {
          label: 'Email:',
          type: 'text',
          placeholder: 'Enter your username',
        },
        password: {
          label: 'Password',
          type: 'password',
        },
      },
      async authorize(credentials) {
        const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080/v1/api'
        try {
          const res = await fetch(`${apiBase}/auth/signin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: credentials?.email, password: credentials?.password }),
          })
          const data = await res.json().catch(() => ({}))
          if (!res.ok || data?.success === false) {
            throw new Error(data?.message || 'Invalid credentials')
          }
          const userData = data?.data || {}
          return {
            id: userData?._id || userData?.id || 'unknown',
            name: userData?.name,
            email: userData?.email,
            role: userData?.role,
            token: data?.token,
          } as any
        } catch (e: any) {
          throw new Error(e?.message || 'Login failed')
        }
      },
    }),
  ],
  secret: 'kvwLrfri/MBznUCofIoRH9+NvGu6GqvVdqO3mor1GuA=',
  pages: {
    signIn: '/auth/sign-in',
  },
  callbacks: {
    async signIn() {
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        ;(token as any).user = user
        ;(token as any).accessToken = (user as any).token
      }
      return token
    },
    async session({ session, token }) {
      const t = token as any
      session.user = {
        ...(t?.user || {}),
        token: t?.accessToken,
      } as any
      return session
    },
  },
  session: {
    maxAge: 24 * 60 * 60 * 1000,
    generateSessionToken: () => {
      return randomBytes(32).toString('hex')
    },
  },
}
