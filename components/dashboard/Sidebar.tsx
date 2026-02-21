"use client";
import React, { useState, useEffect } from "react";
import {
  X,
  HelpCircle,
  LogOut,
  ChevronDown,
  ChevronUp,
  Home,
  BriefcaseBusinessIcon,
  Barcode,
  ShoppingBagIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const pathname = usePathname();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(
    "/images/profile-avatar.jpg",
  );
  const [designerDetails, setDesignerDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Get uid from cookie
  const getUidFromCookie = () => {
    if (typeof document !== "undefined") {
      const match = document.cookie.match(/uid=([^;]+)/);
      return match ? match[1] : null;
    }
    return null;
  };

  useEffect(() => {
    async function fetchDesignerDetails() {
      const uid = getUidFromCookie();
      console.log("Fetching designer details for uid:", uid);
      if (!uid) {
        setLoading(false);
        return;
      }
      try {
        const profileRef = doc(db, "designers", uid);
        const profileSnap = await getDoc(profileRef);
        if (profileSnap.exists()) {
          const data = profileSnap.data();
          console.log("Designer data fetched:", data);
          setDesignerDetails(data);
        } else {
          console.log("No designer document found for uid:", uid);
          setDesignerDetails(null);
        }
      } catch (error) {
        console.error("Error fetching designer details:", error);
        setDesignerDetails(null);
      } finally {
        setLoading(false);
      }
    }
    fetchDesignerDetails();
  }, []);

  const handleLogout = () => {
    document.cookie = "uid=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    document.cookie = "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    document.cookie = "role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    router.push("/login");
  };
  const navigation = [
    { name: "Dashboard", path: "/designer-dashboard", icon: Home },

    {
      name: "Projects",
      icon: Barcode,
      dropdown: [
        { name: "Add Projects", path: "/designer-dashboard/projects/add" },
        { name: "My Projects", path: "/designer-dashboard/projects" },
      ],
    },
    // {
    //   name: "Enquiries",
    //   icon: Send,
    //   dropdown: [
    //     { name: "Enquiries List", path: "/supplier/enquiries" },
    //     { name: "Estimates List", path: "/supplier/estimate-list" },
    //     { name: "Orders List", path: "/supplier/orders" },
    //   ],
    // },
    // {
    //   name: "Accounts",
    //   icon: FileText,
    //   dropdown: [
    //     { name: "Inventory", path: "/supplier/e-inventory" },
    //     { name: "Payment", path: "/supplier/payment" },
    //     { name: "Invoices", path: "/supplier/invoices" },
    //   ],
    // },
    {
      name: "My E-Portfolio",
      path: "/designer-dashboard/portfolio",
      icon: ShoppingBagIcon,
    },
  ];

  const isDropdownActive = (dropdown: { path: string }[]) =>
    dropdown.some((sub) => isActive(sub.path));
  const isActive = (path: string) => pathname === path;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-72 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-fixed ">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-2"
              >
                <Link href="/">
                  <Image
                    width={200}
                    height={64}
                    src="/logo-bg.png"
                    alt="Interinest"
                    className="w-48 h-16 object-contain"
                  />
                </Link>
              </motion.div>
            </div>
            <button
              onClick={onToggle}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border border-blue-500">
                <AvatarImage src="/avatar.png" alt="User" />
              </Avatar>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {loading ? "Loading..." : designerDetails?.fullName || "Unknown Designer"}
                </p>
                <p className="text-xs text-gray-600 truncate">
                  Interior Designer
                </p>
              </div>

              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <ChevronDown
                  className={`w-4 h-4 text-gray-600 transition-transform ${
                    showProfileMenu ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>

            {showProfileMenu && (
              <div className="mt-3 space-y-1">
                <Link
                  href="/designer-dashboard/profile"
                  // className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-800 hover:bg-blue-50 rounded-lg transition-colors"
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive("/designer-dashboard/profile")
                      ? "bg-[#CAAB06] text-white border border-[#CAAB06]"
                      : "hover:text-white hover:bg-[#CAAB06]"
                  }`}
                >
                  <BriefcaseBusinessIcon className="w-4 h-4" />
                  My Profile
                </Link>
                {/* <Link
                  href="/buyer"
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <UserCog2 className="w-4 h-4" />
                  Become a Buyer
                </Link> */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <p className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Main Menu
            </p>

            {navigation.map((item) => {
              const Icon = item.icon;
              // If item has dropdown
              if (item.dropdown) {
                const isDropdownOpen = openDropdown === item.name;
                const dropdownActive = isDropdownActive(item.dropdown);
                return (
                  <div key={item.name}>
                    <button
                      onClick={() =>
                        setOpenDropdown(isDropdownOpen ? null : item.name)
                      }
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
          ${
            isDropdownOpen || dropdownActive
              ? "bg-[#CAAB06] text-white border border-[#CAAB06]"
              : "hover:text-white hover:bg-[#CAAB06]"
          }`}
                    >
                      <Icon className="w-5 h-5" />
                      {item.name}
                      {isDropdownOpen ? (
                        <ChevronUp className="ml-auto w-4 h-4" />
                      ) : (
                        <ChevronDown className="ml-auto w-4 h-4" />
                      )}
                    </button>

                    {isDropdownOpen && (
                      <div className="ml-8 mt-1 space-y-1">
                        {item.dropdown.map((sub) => (
                          <Link
                            key={sub.path}
                            href={sub.path}
                            onClick={() => {
                              if (window.innerWidth < 1024) onToggle();
                            }}
                            className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                              isActive(sub.path)
                                ? "bg-[#CAAB06] text-white border border-[#CAAB06]"
                                : "hover:bg-[#CAAB06] hover:text-white text-shadow-gray-800 "
                            }`}
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => {
                    if (window.innerWidth < 1024) onToggle();
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? "bg-[#CAAB06] text-white border border-[#CAAB06]"
                      : "hover:text-white hover:bg-[#CAAB06]"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      isActive(item.path) ? "text-white" : "text-gray-600"
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Support Section */}
          <div className="p-4 border-t border-gray-200">
            <div className="bg-gradient-to-br from-[#f8f4ec] to-blue-50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-[#CAAB06] rounded-lg">
                  <HelpCircle className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">
                    Need Help?
                  </h3>
                  <p className="text-xs text-gray-600 mb-3">
                    Contact our support team for assistance
                  </p>
                  <button className="w-full px-3 py-1.5 text-xs font-medium 
                  text-white bg-[#CAAB06] rounded-lg hover:bg-[#9a8b05] transition-colors">
                    Get Support
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
