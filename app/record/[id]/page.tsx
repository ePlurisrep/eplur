import RecordViewer from '@/components/RecordViewer'

export default function RecordPage({ params }: { params: { id: string } }) {
  return <RecordViewer id={decodeURIComponent(params.id)} />
}
