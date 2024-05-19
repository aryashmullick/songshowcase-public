
'use client'
import SideBar from '@/Components/sidebar'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import { Suspense } from 'react'
import Loading from './loading'


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <html lang="en">
      <body className={""}>
        {/* hidden  md:max-2xl:grid  */}
      <div className="grid grid-flow-col grid-cols-8 overflow-hidden">
        <SideBar />
      <div className={"overflow-y-auto h-screen col-span-6 rounded-2xl "}>
        <Suspense fallback={<Loading />}>{children}</Suspense>
      </div>
      </div>
        </body>
    </html>
  )
}
