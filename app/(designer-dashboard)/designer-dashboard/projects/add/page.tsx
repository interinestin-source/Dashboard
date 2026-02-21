import { Header } from '@/components/dashboard/Header'
import AddProject from '@/components/projects/AddProject'
import React from 'react'

type Props = {}

const page = (props: Props) => {
       const breadcrumbs = [
    { label: "Home", href: "/designer" },
    { label: "Designer Dashboard" },
  ];
  return (
    <div className="min-h-screen bg-gray-50">
     <Header
        pageTitle="Add Designer Project"
        breadcrumbs={breadcrumbs}
      />
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col space-y-3" >
    

 
  
    <AddProject/>
    </div>
    </div>
  )
}

export default page