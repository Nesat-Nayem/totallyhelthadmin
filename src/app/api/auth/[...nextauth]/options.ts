import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { randomBytes } from 'crypto'

import { API_BASE_URL } from '@/utils/env'

type BackendLoginResponse = {
  success: boolean
  statusCode: number
  message: string
  token: string
  data: any
}

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
        branchId: {
          label: 'Branch',
          type: 'text',
        },
      },
      async authorize(credentials, req) {
        const res = await fetch(`${API_BASE_URL}/auth/signin`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: credentials?.email,
            password: credentials?.password,
            branchId: credentials?.branchId,
          }),
        })

        const data = (await res.json()) as BackendLoginResponse
        if (res.ok && data?.success && data?.token) {
          // Return a user-like object for NextAuth
          return {
            id: data.data?._id ?? data.data?.id ?? 'user',
            email: data.data?.email,
            name: data.data?.name,
            role: data.data?.role,
            branchId: data.data?.branchId,
            token: data.token,
          } as any
        }
        throw new Error(data?.message || 'Invalid credentials')
      },
    }),
  ],
  secret: 'kvwLrfri/MBznUCofIoRH9+NvGu6GqvVdqO3mor1GuA=',
  pages: {
    signIn: '/auth/sign-in',
  },
  callbacks: {
    async signIn({ user }) {
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as any).token
        token.user = {
          email: (user as any).email,
          name: (user as any).name,
          role: (user as any).role,
          branchId: (user as any).branchId,
        }
      }
      return token
    },
    session: ({ session, token }) => {
      ;(session as any).accessToken = (token as any).accessToken
      session.user = {
        email: (token as any).user?.email,
        name: (token as any).user?.name,
      } as any
      return Promise.resolve(session)
    },
  },
  session: {
    maxAge: 24 * 60 * 60 * 1000,
    generateSessionToken: () => {
      return randomBytes(32).toString('hex')
    },
  },
}
