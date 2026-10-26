
import SideBar from '@/Components/sidebar'
import { Suspense } from 'react'
import Loading from './loading'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { readSession } from '@/app/lib/backend'


export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const cookie = await cookies();
  let session = null;
  try { session = await readSession(cookie.get('session_id')?.value); } catch {
    return <main className="p-8">The session service is unavailable. Please try again later.</main>;
  }
  if (!session) redirect('/');
  return (
      <div className="grid grid-flow-col grid-cols-8 overflow-hidden">
        <SideBar />
      <div className={"overflow-y-auto h-screen col-span-6 rounded-2xl "}>
        <Suspense fallback={<Loading />}>{children}</Suspense>
      </div>
      </div>
  )
}
