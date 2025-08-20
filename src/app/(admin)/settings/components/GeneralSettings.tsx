import ChoicesFormInput from '@/components/form/ChoicesFormInput'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { Card, CardBody, CardHeader, CardTitle, Col, Row } from 'react-bootstrap'

const GeneralSettings = () => {
  return (
    <Row>
      <Col lg={12}>
        <Card>
          <CardHeader>
            <CardTitle as={'h4'} className="d-flex align-items-center gap-1">
              <IconifyIcon icon="solar:settings-bold-duotone" className="text-primary fs-20" />
              General Settings
            </CardTitle>
          </CardHeader>
          <CardBody>
            <form>
              <Row>
                <Col lg={6}>
                  <div className="mb-3">
                    <label htmlFor="header-offer-title" className="form-label">
                      Header Offer Title
                    </label>
                    <input type="text" id="header-offer-title" className="form-control" placeholder="Enter offer title" />
                  </div>
                </Col>
                <Col lg={6}>
                  <div className="mb-3">
                    <label htmlFor="offer-start-time" className="form-label">
                      Offer Start Time
                    </label>
                    <input type="time" id="offer-start-time" className="form-control" />
                  </div>
                </Col>

                <Col lg={6}>
                  <div className="mb-3">
                    <label htmlFor="contact-number-1" className="form-label">
                      Contact Number 1
                    </label>
                    <input type="tel" id="contact-number-1" className="form-control" placeholder="Enter contact number" />
                  </div>
                </Col>
                <Col lg={6}>
                  <div className="mb-3">
                    <label htmlFor="contact-number-2" className="form-label">
                      Contact Number 2
                    </label>
                    <input type="tel" id="contact-number-2" className="form-control" placeholder="Enter contact number" />
                  </div>
                </Col>

                <Col lg={6}>
                  <div className="mb-3">
                    <label htmlFor="email-address" className="form-label">
                      Email Address
                    </label>
                    <input type="email" id="email-address" className="form-control" placeholder="Enter email" />
                  </div>
                </Col>
                <Col lg={6}>
                  <div className="mb-3">
                    <label htmlFor="logo-upload" className="form-label">
                      Logo
                    </label>
                    <input type="file" id="logo-upload" className="form-control" />
                  </div>
                </Col>

                <Col lg={6}>
                  <div className="mb-3">
                    <label htmlFor="favicon-upload" className="form-label">
                      Favicon Logo
                    </label>
                    <input type="file" id="favicon-upload" className="form-control" />
                  </div>
                </Col>

                <Col lg={6}>
                  <div className="mb-3">
                    <label htmlFor="facebook-url" className="form-label">
                      Facebook
                    </label>
                    <input type="url" id="facebook-url" className="form-control" placeholder="Enter Facebook URL" />
                  </div>
                </Col>
                <Col lg={6}>
                  <div className="mb-3">
                    <label htmlFor="instagram-url" className="form-label">
                      Instagram
                    </label>
                    <input type="url" id="instagram-url" className="form-control" placeholder="Enter Instagram URL" />
                  </div>
                </Col>
                <Col lg={6}>
                  <div className="mb-3">
                    <label htmlFor="twitter-url" className="form-label">
                      Twitter
                    </label>
                    <input type="url" id="twitter-url" className="form-control" placeholder="Enter Twitter URL" />
                  </div>
                </Col>
                <Col lg={6}>
                  <div className="mb-3">
                    <label htmlFor="youtube-url" className="form-label">
                      YouTube
                    </label>
                    <input type="url" id="youtube-url" className="form-control" placeholder="Enter YouTube URL" />
                  </div>
                </Col>

                <Col lg={6}>
                  <div className="mb-3">
                    <label htmlFor="app-url" className="form-label">
                      Download App URL
                    </label>
                    <input type="url" id="app-url" className="form-control" placeholder="Enter App URL" />
                  </div>
                </Col>
                <Col lg={6}>
                  <div className="mb-3">
                    <label htmlFor="copyright-title" className="form-label">
                      Copyright Title
                    </label>
                    <input type="text" id="copyright-title" className="form-control" placeholder="Enter copyright title" />
                  </div>
                </Col>

                <Col lg={12}>
                  <div>
                    <label htmlFor="office-address" className="form-label">
                      Office Address
                    </label>
                    <textarea className="form-control bg-light-subtle" id="office-address" rows={4} placeholder="Enter office address" />
                  </div>
                </Col>
              </Row>
            </form>
          </CardBody>
        </Card>
      </Col>
    </Row>
  )
}

export default GeneralSettings
