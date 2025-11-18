'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import PageTitle from '@/components/PageTItle'
import ComponentContainerCard from '@/components/ComponentContainerCard'
import { Button, Spinner, Row, Col } from 'react-bootstrap'
import { useGetTermsConditionQuery, useCreateOrUpdateTermsConditionMutation } from '@/services/termsConditionApi'
import { toast } from 'react-toastify'

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

const TermsPage: React.FC = () => {
  const [content, setContent] = useState<string>('<p>Terms & Conditions content goes here.</p>')
  const { data: termsConditionResponse, isLoading, refetch } = useGetTermsConditionQuery()
  const [createOrUpdate, { isLoading: isSaving }] = useCreateOrUpdateTermsConditionMutation()

  // Load existing content when data is fetched
  useEffect(() => {
    if (termsConditionResponse?.data?.content) {
      setContent(termsConditionResponse.data.content)
    }
  }, [termsConditionResponse])

  const handleSave = async () => {
    try {
      if (!content || content.trim() === '' || content === '<p><br></p>') {
        toast.error('Please enter some content before saving')
        return
      }

      const result = await createOrUpdate({ content }).unwrap()
      toast.success(result.message || 'Terms & Conditions saved successfully')
      refetch()
    } catch (error: any) {
      console.error('Error saving Terms & Conditions:', error)
      toast.error(error?.data?.message || error?.message || 'Failed to save Terms & Conditions')
    }
  }

  if (isLoading) {
    return (
      <>
        <PageTitle title="TERMS & CONDITIONS" />
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <Spinner animation="border" variant="primary" />
        </div>
      </>
    )
  }

  return (
    <>
      <PageTitle title="TERMS & CONDITIONS" />

      <ComponentContainerCard id="quill-snow-editor" title="Terms & Conditions" description={''}>
        <ReactQuill
          id="snow-editor"
          theme="snow"
          modules={modules}
          value={content}
          onChange={setContent}
          style={{ height: 'auto', minHeight: '300px' }}
        />
        <div className="mt-4 pt-3 border-top">
          <Row className="justify-content-end g-2">
            <Col lg={2}>
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={isSaving}
                className="w-100"
              >
                {isSaving ? (
                  <>
                    <Spinner size="sm" className="me-2" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </Col>
          </Row>
        </div>
      </ComponentContainerCard>
    </>
  )
}

export default TermsPage
