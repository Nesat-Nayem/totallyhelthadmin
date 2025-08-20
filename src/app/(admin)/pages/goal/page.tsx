import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import Goal from './components/Goal'

export const metadata: Metadata = { title: 'Goal' }

const GoalPage = () => {
  return (
    <>
      <PageTItle title="Add Goal Info" />
      <Goal />
    </>
  )
}

export default GoalPage
