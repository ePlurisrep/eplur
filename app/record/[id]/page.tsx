import { redirect } from 'next/navigation'

type Props = { params: { id: string } }

export default function RedirectRecord({ params }: Props) {
  // canonical route moved to /records/[id]
  redirect(`/records/${encodeURIComponent(params.id)}`)
}
