'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import PageTitle from '@/components/PageTItle'
import ComponentContainerCard from '@/components/ComponentContainerCard'

// styles
import 'react-quill/dist/quill.snow.css'
import 'react-quill/dist/quill.bubble.css'

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })

const modules: NonNullable<React.ComponentProps<typeof ReactQuill>['modules']> = {
  toolbar: [
    [{ font: [] }, { size: [] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ color: [] }, { background: [] }],
    [{ script: 'super' }, { script: 'sub' }],
    [{ header: [false, 1, 2, 3, 4, 5, 6] }, 'blockquote', 'code-block'],
    [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
    ['direction', { align: [] }],
    ['link', 'image', 'video'],
    ['clean'],
  ],
}

const PrivacyPolicyPage: React.FC = () => {
  return (
    <>
      <PageTitle title="PRIVACY POLICY" />

      <ComponentContainerCard id="quill-snow-editor" title="Privacy Policy" description={''}>
        <ReactQuill id="snow-editor" theme="snow" modules={modules} style={{ height: 'auto' }} />
      </ComponentContainerCard>
    </>
  )
}

export default PrivacyPolicyPage
