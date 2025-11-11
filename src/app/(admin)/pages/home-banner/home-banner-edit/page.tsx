'use client'
import React, { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import PageTItle from '@/components/PageTItle'
import HomeBannerEdit from './components/HomeBannerEdit'

const HomeBannerEditContent = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams.get('id')

  useEffect(() => {
    if (!id) {
      router.push('/pages/home-banner')
    }
  }, [id, router])

  if (!id) {
    return null
  }

  return (
    <>
      <PageTItle title="Home Banner Edit" />
      <HomeBannerEdit id={id} />
    </>
  )
}

const HomeBannerEditPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeBannerEditContent />
    </Suspense>
  )
}

export default HomeBannerEditPage
