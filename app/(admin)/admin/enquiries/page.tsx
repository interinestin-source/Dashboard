import { Header } from '@/components/admin/Header'
import React from 'react'

type Props = {}

const page = (props: Props) => {
      const breadcrumbs = [
    { label: "Home", href: "/admin" },
    { label: "Enquiries" },
  ];
  return (
  <div className="min-h-screen bg-gray-50">
          <Header pageTitle="Project Details" breadcrumbs={breadcrumbs} />
          <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
            Under Construction...
            </div>
            </div>
  )
}

export default page