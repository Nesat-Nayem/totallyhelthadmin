import ComponentContainerCard from '@/components/ComponentContainerCard'
import DropzoneFormInput from '@/components/form/DropzoneFormInput'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Link from 'next/link'
import React from 'react'
import { Card, CardBody, CardFooter, CardHeader, CardTitle, Col, Container, Row } from 'react-bootstrap'

const EditBlog = () => {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle as={'h4'}>Edit Blog</CardTitle>
        </CardHeader>
        <CardBody>
          <Row>
            <Col lg={4}>
              <form>
                <label htmlFor="handshake" className="form-label">
                  Upload Banner
                </label>
                <div className="input-group mb-3">
                  <input type="file" id="handshake" className="form-control" defaultValue={''} />
                </div>
              </form>
            </Col>
            <Col lg={4}>
              <form>
                <label htmlFor="Title" className="form-label">
                  Title
                </label>
                <div className="input-group mb-3">
                  <input type="text" id="Title" className="form-control" defaultValue={''} />
                </div>
              </form>
            </Col>
            <Col lg={4}>
              <form>
                <label htmlFor="Category" className="form-label">
                  Category
                </label>
                <select className="form-control" id="Category" data-choices data-choices-groups data-placeholder="Select Gender">
                  <option>Select Category</option>
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                  <option value="Other">Other</option>
                </select>
              </form>
            </Col>

            <Col lg={12}>
              <div className="mb-3">
                <label htmlFor="short-description" className="form-label">
                  Short Description
                </label>
                <textarea
                  className="form-control bg-light-subtle"
                  id="short-description"
                  rows={7}
                  placeholder="Short description about the product"
                  defaultValue={''}
                />
              </div>
            </Col>
            <Col lg={12}>
              <div className="mb-3">
                <label htmlFor="short-description" className="form-label">
                  Description
                </label>
                <textarea className="form-control bg-light-subtle" id="description" rows={7} placeholder="" defaultValue={''} />
              </div>
            </Col>
            <Col lg={12}>
              <form>
                <label htmlFor="Title" className="form-label">
                  Tag
                </label>
                <div className="input-group mb-3">
                  <input type="text" id="Title" className="form-control" defaultValue={''} />
                </div>
              </form>
            </Col>
          </Row>
        </CardBody>
      </Card>

      <div className="p-3 bg-light mb-3 rounded">
        <Row className="justify-content-end g-2">
          <Col lg={2}>
            <Link href="" className="btn btn-outline-secondary w-100">
              Create
            </Link>
          </Col>
          <Col lg={2}>
            <Link href="" className="btn btn-primary w-100">
              Cancel
            </Link>
          </Col>
        </Row>
      </div>
    </>
  )
}

export default EditBlog
