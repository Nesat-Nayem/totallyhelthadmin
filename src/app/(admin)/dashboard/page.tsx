import { Row } from 'react-bootstrap'
import Stats from './components/Stats'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dashboard' }

const DashboardPage = () => {
  return (
    <>
      <Row>
        <Stats />
      </Row>
    </>
  )
}

export default DashboardPage
