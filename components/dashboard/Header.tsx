"use client";
import { BreadcrumbItem } from "@/components/ui/breadcrumb";
import React, { useEffect, useState } from "react";

import Link from "next/link";

import { Menu } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useSidebar } from "./SidebarClientWrapper";

// import { useAuth } from "@/context/AuthContext";
// import { doc, getDoc } from "firebase/firestore";
// import { db } from "@/lib/firebase";

interface HeaderProps {
  userAvatar?: string;
  pageTitle?: string;
  breadcrumbs?: { label: string; href?: string }[];
  onSidebarToggle?: () => void;
}

type NavigationLink = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};
function getUserRole() {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp("(^| )role=([^;]+)"));
  return m ? decodeURIComponent(m[2]) : null;
}

export function Header({ pageTitle, breadcrumbs }: HeaderProps) {
  const { toggleSidebar } = useSidebar();
  // const [userDetails, setUserDetails] = useState<any>(null);
  // const { uid, authLoading } = useAuth();
  // useEffect(() => {
  //   async function fetchUserDetails() {
  //     if (!uid) return;
  //     try {
  //       const profileRef = doc(db, "users", uid);
  //       const profileSnap = await getDoc(profileRef);
  //       if (profileSnap.exists()) {
  //         setUserDetails(profileSnap.data());
  //       } else {
  //         setUserDetails(null);
  //       }
  //     } catch {
  //       setUserDetails(null);
  //     }
  //   }
  //   fetchUserDetails();
  // }, [uid]);
  return (
    <>
      <header
        className=" bg-white  border-b sticky 
      top-0 z-40 w-full"
      >
        <div className="max-w-full  mx-auto  p-4 flex flex-col space-y-1 ">
          <div className="  flex flex-row items-center justify-between">
            <div className="sm:hidden inline-flex">
              <button
                onClick={toggleSidebar}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
              >
                <Menu className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="flex sm:flex-row flex-col justify-between items-center  w-full px-2">
              <div className="flex sm:flex-row flex-col justify-center items-center sm:justify-start sm:space-x-8">
                <div>
                  {pageTitle && (
                    <h1 className="text-base sm:text-lg font-semibold text-gray-900 truncate ">
                      {pageTitle}
                    </h1>
                  )}
                </div>
                <div>
                  {breadcrumbs && breadcrumbs.length > 0 && (
                    <div className=" overflow-x-auto ">
                      <Breadcrumb>
                        <BreadcrumbList>
                          {breadcrumbs.map((item, index) => (
                            <React.Fragment key={item.label}>
                              <BreadcrumbItem>
                                {item.href ? (
                                  <BreadcrumbLink asChild>
                                    <Link href={item.href}>{item.label}</Link>
                                  </BreadcrumbLink>
                                ) : (
                                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                                )}
                              </BreadcrumbItem>
                              {index < breadcrumbs.length - 1 && (
                                <BreadcrumbSeparator />
                              )}
                            </React.Fragment>
                          ))}
                        </BreadcrumbList>
                      </Breadcrumb>
                    </div>
                  )}
                </div>
              </div>

              <div>
                {/* {userDetails && (
                  <h1 className="font-bold text-blue-900">
                    {" "}
                    {userDetails.companyName || "Unknown User"}
                  </h1>
                )} */}
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
