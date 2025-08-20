import React from 'react'
import GeneralSettings from './components/GeneralSettings'
import PageTItle from '@/components/PageTItle'
import Link from 'next/link'

const SettingsPage = () => {
  return (
    <>
      <PageTItle title="SETTINGS" />
      <GeneralSettings />
      <div className="text-end">
        <Link href="" className="btn btn-danger">
          Cancel
        </Link>
        &nbsp;
        <Link href="" className="btn btn-success">
          Save Change
        </Link>
      </div>
    </>
  )
}

export default SettingsPage
