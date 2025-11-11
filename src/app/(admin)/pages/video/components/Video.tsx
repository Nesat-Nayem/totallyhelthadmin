'use client'

import React, { useEffect, useState } from 'react'
import * as yup from 'yup'
import { useForm, Control, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row, Spinner } from 'react-bootstrap'
import { useGetVideoQuery, useUpsertVideoMutation } from '@/services/videoApi'
import { toast } from 'react-toastify'
import TextFormInput from '@/components/form/TextFormInput'
import { uploadSingle } from '@/services/upload'
import Image from 'next/image'

/** VALIDATION SCHEMA **/
const schema = yup.object({
  videoUrl: yup.string().required('Video URL is required').url('Please enter a valid URL'),
  status: yup.string().oneOf(['active', 'inactive'], 'Status must be active or inactive').required('Please select a status'),
})

/** FORM FIELD TYPES (derived from schema) **/
type FormData = yup.InferType<typeof schema>

/** Helper function to extract YouTube video ID from URL **/
const getYouTubeVideoId = (url: string): string | null => {
  if (!url) return null
  
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/.*[?&]v=([^&\n?#]+)/,
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }
  
  return null
}

/** GENERAL INFORMATION CARD **/
const GeneralInformationCard: React.FC<{ 
  control: Control<FormData>
  currentBrandLogo?: string
  onFileChange: (f: File | null) => void
}> = ({ control, currentBrandLogo, onFileChange }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle as="h4">General Information</CardTitle>
      </CardHeader>
      <CardBody>
        <Row>
          <Col lg={6}>
            <div className="mb-3">
              <label className="form-label">Brand Logo</label>
              <input 
                className="form-control" 
                type="file" 
                accept="image/*" 
                onChange={(e) => onFileChange(e.target.files?.[0] || null)} 
              />
              {currentBrandLogo && (
                <div className="mt-2">
                  <Image 
                    src={currentBrandLogo} 
                    alt="Brand Logo" 
                    width={100} 
                    height={100} 
                    className="rounded border" 
                    unoptimized 
                  />
                </div>
              )}
            </div>
          </Col>
          <Col lg={6}>
            <div className="mb-3">
              <TextFormInput control={control} type="url" name="videoUrl" label="Video URL" placeholder="Enter video URL" />
            </div>
          </Col>
          <Col lg={12}>
            <label className="form-label">Status</label>
            <Controller
              control={control}
              name="status"
              render={({ field, fieldState }) => (
                <>
                  <div className="d-flex gap-2 align-items-center">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        value="active"
                        id="statusActive"
                        checked={field.value === 'active'}
                        onChange={field.onChange}
                      />
                      <label className="form-check-label" htmlFor="statusActive">
                        Active
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        value="inactive"
                        id="statusInactive"
                        checked={field.value === 'inactive'}
                        onChange={field.onChange}
                      />
                      <label className="form-check-label" htmlFor="statusInactive">
                        Inactive
                      </label>
                    </div>
                  </div>
                  {fieldState.error && <small className="text-danger">{fieldState.error.message}</small>}
                </>
              )}
            />
          </Col>
        </Row>
      </CardBody>
    </Card>
  )
}

/** MAIN COMPONENT **/
const Video: React.FC = () => {
  const { data: videoResponse, isLoading, refetch } = useGetVideoQuery()
  const [upsertVideo, { isLoading: isSubmitting }] = useUpsertVideoMutation()
  const [file, setFile] = useState<File | null>(null)

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      videoUrl: '',
      status: 'active',
    },
  })

  // Populate form when video data is fetched
  useEffect(() => {
    if (videoResponse?.data) {
      const video = videoResponse.data
      reset({
        videoUrl: video.videoUrl || '',
        status: video.status || 'active',
      })
    } else {
      // Reset to defaults if no video exists
      reset({
        videoUrl: '',
        status: 'active',
      })
    }
  }, [videoResponse, reset])

  const onSubmit = async (data: FormData) => {
    try {
      let brandLogo: string | undefined = videoResponse?.data?.brandLogo
      
      // Upload new file if selected
      if (file) {
        brandLogo = await uploadSingle(file)
      }

      const payload = {
        brandLogo,
        videoUrl: data.videoUrl.trim(),
        status: data.status,
      }

      const result = await upsertVideo(payload).unwrap()
      toast.success(result.message || 'Video saved successfully')
      setFile(null) // Reset file after successful upload
      refetch()
    } catch (error: any) {
      toast.error(error?.data?.message || error?.message || 'Failed to save video')
    }
  }

  if (isLoading) {
    return (
      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader>
              <CardTitle as="h4">Video Area</CardTitle>
            </CardHeader>
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
              <Spinner animation="border" variant="primary" />
            </div>
          </Card>
        </Col>
      </Row>
    )
  }

  const existingVideo = videoResponse?.data

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <GeneralInformationCard 
        control={control} 
        currentBrandLogo={videoResponse?.data?.brandLogo}
        onFileChange={setFile}
      />
      {existingVideo && (
        <>
          <Card className="mt-3">
            <CardHeader>
              <CardTitle as="h5">Current Video</CardTitle>
            </CardHeader>
            <CardBody>
              <Row>
                <Col lg={12}>
                  {/* Video Preview */}
                  {existingVideo.videoUrl && (() => {
                    const videoId = getYouTubeVideoId(existingVideo.videoUrl)
                    return videoId ? (
                      <div className="mb-3">
                        <div className="ratio ratio-16x9" style={{ maxWidth: '800px' }}>
                          <iframe
                            src={`https://www.youtube.com/embed/${videoId}`}
                            title="Video Preview"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            style={{ border: 'none', borderRadius: '8px' }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="mb-3">
                        <a 
                          href={existingVideo.videoUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="btn btn-primary"
                        >
                          Watch Video
                        </a>
                      </div>
                    )
                  })()}
                  
                  {/* Brand Logo */}
                  {existingVideo.brandLogo && (
                    <div className="mb-3">
                      <strong>Brand Logo:</strong>
                      <div className="mt-2">
                        <a href={existingVideo.videoUrl} target="_blank" rel="noopener noreferrer">
                          <Image 
                            src={existingVideo.brandLogo} 
                            alt="Brand Logo" 
                            width={100} 
                            height={100} 
                            className="rounded border" 
                            unoptimized 
                          />
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {/* Video URL */}
                  <div className="mb-2">
                    <strong>Video URL:</strong>
                    <div className="mt-1">
                      <a href={existingVideo.videoUrl} target="_blank" rel="noopener noreferrer" className="text-primary text-break">
                        {existingVideo.videoUrl}
                      </a>
                    </div>
                  </div>
                  
                  {/* Status */}
                  <div className="mb-2">
                    <strong>Status:</strong>
                    <div className="mt-1">
                      <span className={`badge ${existingVideo.status === 'active' ? 'bg-success' : 'bg-danger'}`}>
                        {existingVideo.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Timestamps */}
                  <div className="text-muted small">
                    {existingVideo.createdAt && (
                      <div>Created: {existingVideo.createdAt}</div>
                    )}
                    {existingVideo.updatedAt && existingVideo.updatedAt !== existingVideo.createdAt && (
                      <div>Updated: {existingVideo.updatedAt}</div>
                    )}
                  </div>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </>
      )}
      <div className="p-3 bg-light mb-3 rounded">
        <Row className="justify-content-end g-2">
          <Col lg={2}>
            <Button variant="outline-secondary" type="submit" className="w-100" disabled={isSubmitting}>
              {isSubmitting ? <Spinner size="sm" /> : 'Save'}
            </Button>
          </Col>
          <Col lg={2}>
            <Button
              variant="primary"
              type="button"
              className="w-100"
              onClick={() => {
                if (existingVideo) {
                  reset({
                    videoUrl: existingVideo.videoUrl || '',
                    status: existingVideo.status || 'active',
                  })
                } else {
                  reset({
                    videoUrl: '',
                    status: 'active',
                  })
                }
                setFile(null) // Reset file selection
              }}
            >
              Cancel
            </Button>
          </Col>
        </Row>
      </div>
    </form>
  )
}

export default Video
