"use client";
import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "../ui/card";
import {
  DollarSign,
  MessageSquare,
  Package,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

const statsData = [
  {
    id: "products",
    title: "Total Products",
    value: 120,
    delta: 8,
    trendUp: true,
    icon: Package,
    iconBg: "bg-yellow-100 text-yellow-700",
    accent: "from-yellow-50 to-yellow-100",
  },
  {
    id: "projects",
    title: "Total Projects",
    value: 42,
    delta: 14,
    trendUp: true,
    icon: TrendingUp,
    iconBg: "bg-green-100 text-green-700",
    accent: "from-green-50 to-green-100",
  },
  {
    id: "enquiries",
    title: "New Enquiries",
    value: 9,
    delta: -3,
    trendUp: false,
    icon: MessageSquare,
    iconBg: "bg-blue-100 text-blue-700",
    accent: "from-blue-50 to-blue-100",
  },
  {
    id: "inprogress",
    title: "In‑progress",
    value: 7,
    delta: 2,
    trendUp: true,
    icon: DollarSign,
    iconBg: "bg-purple-100 text-purple-700",
    accent: "from-purple-50 to-purple-100",
  },
];

function Sparkline({ variant }: { variant: "up" | "down" | "flat" }) {
  if (variant === "up") {
    return (
      <svg
        className="w-24 h-6"
        viewBox="0 0 96 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <path
          d="M2 18L20 12L36 14L56 6L76 10L94 2"
          stroke="rgba(34,197,94,0.95)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (variant === "down") {
    return (
      <svg
        className="w-24 h-6"
        viewBox="0 0 96 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <path
          d="M2 6L20 10L36 8L56 16L76 12L94 20"
          stroke="rgba(239,68,68,0.95)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg
      className="w-24 h-6"
      viewBox="0 0 96 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M2 12L22 10L44 12L66 10L88 12"
        stroke="rgba(107,114,128,0.85)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const Stats: React.FC = () => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.06 } },
      }}
      className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
    >
      {statsData.map((s, i) => {
        const Icon = s.icon;
        const trendClass = s.trendUp
          ? "text-green-600 bg-green-50"
          : "text-red-600 bg-red-50";
        const Arrow = s.trendUp ? ArrowUpRight : ArrowDownRight;
        const sparkVariant = s.trendUp ? "up" : s.delta === 0 ? "flat" : "down";

        return (
          <motion.div
            key={s.id}
            variants={{
              hidden: { opacity: 0, y: 8 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            whileHover={{ y: -6, scale: 1.01 }}
            className="rounded"
          >
            <Card className="overflow-hidden">
              <div className={`p-4 bg-gradient-to-r ${s.accent} border-b`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-md ${s.iconBg} inline-flex items-center justify-center shadow-sm`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-600">
                        {s.title}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {s.value}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <motion.span
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.35, delay: 0.08 }}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full ${trendClass}`}
                    >
                      <Arrow className="w-3 h-3" />
                      {Math.abs(s.delta)}%
                    </motion.span>
                  </div>
                </div>
              </div>

              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Sparkline variant={sparkVariant as any} />
                    <div>
                      <div className="text-sm font-medium text-gray-700">
                        This month
                      </div>
                      <div className="text-xs text-gray-400">vs last month</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm text-gray-600">Trend</div>
                    <div
                      className={`mt-1 font-medium ${
                        s.trendUp ? "text-green-700" : "text-red-700"
                      }`}
                    >
                      {s.trendUp ? "Improving" : "Declining"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default Stats;