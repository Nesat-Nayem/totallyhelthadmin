import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { Card, CardBody, CardFooter, CardHeader, CardTitle, Col, Row } from 'react-bootstrap'

import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Faqs' }

const FaqsPage = () => {
  return (
    <>
      <PageTItle title="FAQS" />

      <Card>
        <CardHeader>
          <CardTitle as={'h4'}>Edit FAQS</CardTitle>
        </CardHeader>
        <CardBody>
          <Row>
            <Col lg={12}>
              <form>
                <label htmlFor="Question" className="form-label">
                  Question
                </label>
                <div className="input-group mb-3">
                  <input type="text" id="Question" className="form-control" defaultValue={'Lorem ipsum dolor sit amet.'} />
                </div>
              </form>
            </Col>
            <Col lg={12}>
              <form>
                <label htmlFor="Answer" className="form-label">
                  Answer
                </label>
                <div className="input-group mb-3">
                  <input type="text" id="Answer" className="form-control" defaultValue={'Lorem ipsum dolor sit amet.'} />
                </div>
              </form>
            </Col>
            <Col lg={12}>
              <form>
                <label htmlFor="status" className="form-label">
                  Status
                </label>
                <select className="form-control" id="status" data-choices data-choices-groups data-placeholder="Select Gender">
                  <option>Select Status</option>
                  <option value="Active">Active</option>
                  <option value="InActive">InActive</option>
                </select>
              </form>
            </Col>
          </Row>
        </CardBody>
      </Card>

      <div className="p-3 bg-light mb-3 rounded">
        <Row className="justify-content-end g-2">
          <Col lg={2}>
            <Link href="" className="btn btn-outline-secondary w-100">
              Update
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

export default FaqsPage
