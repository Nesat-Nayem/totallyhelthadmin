import LogoEdit from '../components/LogoEdit'

interface LogoEditPageProps {
  params: {
    id: string
  }
}

export default function LogoEditPage({ params }: LogoEditPageProps) {
  return <LogoEdit id={params.id} />
}

