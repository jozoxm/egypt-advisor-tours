import { redirect } from 'next/navigation'

// The CMS root redirects straight to the Payload admin panel.
export default function Page() {
  redirect('/admin')
}
