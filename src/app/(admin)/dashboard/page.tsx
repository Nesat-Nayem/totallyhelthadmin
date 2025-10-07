import { Row } from 'react-bootstrap'
import Stats from './components/Stats'
import { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'

export const metadata: Metadata = { title: 'Dashboard' }

const DashboardPage = () => {
  return (
    <>
      <PageTItle title="Dashboard" />
      <Row>
        <Stats />
      </Row>
    </>
  )
}

export default DashboardPage
