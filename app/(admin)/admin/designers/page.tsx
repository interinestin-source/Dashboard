import Desingers from '@/components/admin/Desingers';
import { Header } from '@/components/admin/Header'

import React from 'react'

type Props = {}

const page = (props: Props) => {
      const breadcrumbs = [
    { label: "Home", href: "/admin" },
    { label: "Designers" },
  ];
  return (
  <>
  <div className="min-h-screen bg-gray-50">
   <Header
          pageTitle="Admin Dashboard"
          breadcrumbs={breadcrumbs}
        />
              <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col space-y-3" >
     
         <Desingers showPagination pageSize={10} />
           </div>
           </div>
  </>
  )
}

export default page