'use client'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'

import { useNotificationContext } from '@/context/useNotificationContext'
import useQueryParams from '@/hooks/useQueryParams'
import { useGetBranchesQuery } from '@/services/branchApi'

const useSignIn = () => {
  const [loading, setLoading] = useState(false)
  const { push } = useRouter()
  const { showNotification } = useNotificationContext()

  const queryParams = useQueryParams()

  const loginFormSchema = yup.object({
    email: yup.string().email('Please enter a valid email').required('Please enter your email'),
    password: yup.string().required('Please enter your password'),
    branchId: yup.string().required('Please select a branch'),
  })

  const { control, handleSubmit } = useForm({
    resolver: yupResolver(loginFormSchema),
    defaultValues: {
      email: 'user@demo.com',
      password: '123456',
      branchId: '',
    },
  })

  type LoginFormFields = yup.InferType<typeof loginFormSchema>

  // Fetch branches for selection
  const { data: branches = [], isLoading: branchesLoading } = useGetBranchesQuery()

  const login = handleSubmit(async (values: LoginFormFields) => {
    setLoading(true)
    signIn('credentials', {
      redirect: false,
      email: values?.email,
      password: values?.password,
      branchId: values?.branchId,
    }).then((res) => {
      if (res?.ok) {
        push(queryParams['redirectTo'] ?? '/dashboard')
        showNotification({ message: 'Successfully logged in. Redirecting....', variant: 'success' })
      } else {
        showNotification({ message: res?.error ?? '', variant: 'danger' })
      }
    })
    setLoading(false)
  })

  return { loading, login, control, branches, branchesLoading }
}

export default useSignIn
