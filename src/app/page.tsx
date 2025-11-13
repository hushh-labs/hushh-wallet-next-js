import { redirect } from 'next/navigation'

export default function Home() {
  // Redirect to dashboard - this is the main entry point
  redirect('/dashboard')
}
