import Desingers from '@/components/admin/Desingers';
import { Header } from '@/components/admin/Header';
import Link from 'next/link';

const page = () => {
  const breadcrumbs = [
    { label: "Home", href: "/admin" },
    { label: "Designers" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header pageTitle="Designers" breadcrumbs={breadcrumbs} />
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col space-y-3">
        <div className="flex justify-end">
          <Link
            href="/admin/designers/add"
            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Add Designer
          </Link>
        </div>
        <Desingers showPagination pageSize={10} />
      </div>
    </div>
  );
}

export default page