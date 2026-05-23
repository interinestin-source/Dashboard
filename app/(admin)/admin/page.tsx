

import AdminStats from '@/components/admin/AdminStats'
import React from 'react'
import { Header } from '@/components/admin/Header'
import Desingers from '@/components/admin/Desingers'
import Users from '@/components/admin/Users'
import Projects from '@/components/admin/Projects'

type Props = {}

const page = (props: Props) => {
  const breadcrumbs = [
    { label: "Home", href: "/admin" },
    { label: " Dashboard" },
  ];
  return (
    <>
    
     <div className="min-h-screen bg-gray-50">
    <Header
        pageTitle="Admin Dashboard"
        breadcrumbs={breadcrumbs}
      />
            <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col space-y-3" >
      <h2 className="text-xl font-semibold ">Welcome! Admin</h2>
      <AdminStats />

      <div className="grid gap-4 lg:grid-cols-2">
        <Desingers recent pageSize={5} />
        <Users recent pageSize={5} />
      </div>
      <div className="mt-4">
        <Projects />
      </div>
      </div>
      </div>

      </>
  )
}

export default page