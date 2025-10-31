// app/page.tsx
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/dashboard'); // 307 redirect on server
}
