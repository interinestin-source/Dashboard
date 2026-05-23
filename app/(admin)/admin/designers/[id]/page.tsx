"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";

type DesignerDetail = {
  id: string;
  fullName?: string;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  country?: string;
  address?: string;
  pincode?: string;
  designerType?: string;
  status?: string;
  bio?: string;
  portfolio?: string[];
  skills?: string[];
  experience?: string;
  yearsOfExperience?: number;
  profileImage?: string;
  certifications?: string[];
  socialLinks?: {
    instagram?: string;
    linkedin?: string;
    twitter?: string;
    behance?: string;
    dribbble?: string;
    website?: string;
  };
  specializations?: string[];
  hourlyRate?: number;
  availability?: string;
  createdAt?: { seconds: number; nanoseconds: number };
  updatedAt?: { seconds: number; nanoseconds: number };
  [key: string]: any;
};

export default function DesignerDetailPage() {
  const params = useParams();
  const designerId = params.id as string;

  const [designer, setDesigner] = useState<DesignerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchDesigner = async () => {
      if (!designerId) return;

      setLoading(true);
      setError(null);
      try {
        const designerRef = doc(db, "interinestUsers", designerId);
        const snapshot = await getDoc(designerRef);

        if (snapshot.exists()) {
          setDesigner({
            id: snapshot.id,
            ...(snapshot.data() as Omit<DesignerDetail, "id">),
          });
        } else {
          setError("Designer not found.");
        }
      } catch (err) {
        console.error("Failed to load designer details", err);
        setError("Unable to load designer details.");
      } finally {
        setLoading(false);
      }
    };

    void fetchDesigner();
  }, [designerId]);

  const handleApprove = async () => {
    if (!designerId) return;

    setUpdating(true);
    setSuccessMessage("");
    try {
      const designerRef = doc(db, "interinestUsers", designerId);
      await updateDoc(designerRef, {
        status: "approved",
        updatedAt: new Date(),
      });
      setDesigner((prev) => (prev ? { ...prev, status: "approved" } : null));
      setSuccessMessage("Designer approved successfully!");
    } catch (err) {
      console.error("Failed to approve designer", err);
      setError("Failed to approve designer.");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeny = async () => {
    if (!designerId) return;

    setUpdating(true);
    setSuccessMessage("");
    try {
      const designerRef = doc(db, "interinestUsers", designerId);
      await updateDoc(designerRef, {
        status: "rejected",
        updatedAt: new Date(),
      });
      setDesigner((prev) => (prev ? { ...prev, status: "rejected" } : null));
      setSuccessMessage("Designer rejected successfully!");
    } catch (err) {
      console.error("Failed to reject designer", err);
      setError("Failed to reject designer.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-slate-600">Loading designer details...</div>
        </div>
      </div>
    );
  }

  if (error && !designer) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-700 mb-4">
            {error}
          </div>
          <Link href="/admin/designers">
            <Button variant="outline">Back to Designers</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!designer) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-slate-600">Designer not found.</div>
          <Link href="/admin/designers">
            <Button variant="outline" className="mt-4">
              Back to Designers
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Designer Details</h1>
            <p className="mt-1 text-slate-600">Review and manage designer profile</p>
          </div>
          <Link href="/admin/designers">
            <Button variant="outline">← Back to Designers</Button>
          </Link>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-green-700">
            {successMessage}
          </div>
        )}

        {/* Status Badge */}
        <div className="mb-6">
          <span
            className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
              designer.status
            )}`}
          >
            Status: {designer.status ? designer.status.charAt(0).toUpperCase() + designer.status.slice(1) : "Pending"}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information Card */}
            <Card className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Personal Information</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Full Name</label>
                    <p className="mt-1 text-slate-900 font-medium">{designer.fullName || "N/A"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Email</label>
                    <p className="mt-1 text-slate-900">
                      <a href={`mailto:${designer.email}`} className="text-blue-600 hover:underline">
                        {designer.email || "N/A"}
                      </a>
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Phone</label>
                    <p className="mt-1 text-slate-900">
                      <a href={`tel:${designer.phone}`} className="text-blue-600 hover:underline">
                        {designer.phone || "N/A"}
                      </a>
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Designer Type</label>
                    <p className="mt-1 text-slate-900">{designer.designerType || "N/A"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">City</label>
                    <p className="mt-1 text-slate-900">{designer.city || "N/A"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">State</label>
                    <p className="mt-1 text-slate-900">{designer.state || "N/A"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Country</label>
                    <p className="mt-1 text-slate-900">{designer.country || "N/A"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Postal Code</label>
                    <p className="mt-1 text-slate-900">{designer.pincode || "N/A"}</p>
                  </div>
                </div>

                {designer.address && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Address</label>
                    <p className="mt-1 text-slate-900">{designer.address}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Professional Information Card */}
            <Card className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Professional Information</h2>
              <div className="space-y-4">
                {designer.bio && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Bio</label>
                    <p className="mt-1 text-slate-900">{designer.bio}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {designer.yearsOfExperience && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Years of Experience</label>
                      <p className="mt-1 text-slate-900">{designer.yearsOfExperience}+ years</p>
                    </div>
                  )}
                  {designer.hourlyRate && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Hourly Rate</label>
                      <p className="mt-1 text-slate-900">${designer.hourlyRate}/hour</p>
                    </div>
                  )}
                  {designer.availability && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Availability</label>
                      <p className="mt-1 text-slate-900">{designer.availability}</p>
                    </div>
                  )}
                </div>

                {designer.experience && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Experience Details</label>
                    <p className="mt-1 text-slate-900">{designer.experience}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Skills Card */}
            {designer.skills && Array.isArray(designer.skills) && designer.skills.length > 0 && (
              <Card className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-slate-900">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {designer.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-block bg-blue-100 px-3 py-1 rounded-full text-sm font-medium text-blue-800"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </Card>
            )}

            {/* Specializations Card */}
            {designer.specializations && Array.isArray(designer.specializations) && designer.specializations.length > 0 && (
              <Card className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-slate-900">Specializations</h2>
                <div className="flex flex-wrap gap-2">
                  {designer.specializations.map((spec, idx) => (
                    <span
                      key={idx}
                      className="inline-block bg-purple-100 px-3 py-1 rounded-full text-sm font-medium text-purple-800"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </Card>
            )}

            {/* Certifications Card */}
            {designer.certifications && Array.isArray(designer.certifications) && designer.certifications.length > 0 && (
              <Card className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-slate-900">Certifications</h2>
                <ul className="space-y-2">
                  {designer.certifications.map((cert, idx) => (
                    <li key={idx} className="flex items-start text-slate-900">
                      <span className="mr-2 text-blue-600 font-bold">✓</span>
                      {cert}
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Portfolio Card */}
            {designer.portfolio && Array.isArray(designer.portfolio) && designer.portfolio.length > 0 && (
              <Card className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-slate-900">Portfolio</h2>
                <div className="space-y-2">
                  {designer.portfolio.map((item, idx) => (
                    <a
                      key={idx}
                      href={item}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-lg border border-slate-200 p-3 text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition break-all text-sm"
                    >
                      🔗 {item}
                    </a>
                  ))}
                </div>
              </Card>
            )}

            {/* Social Links Card */}
            {designer.socialLinks && Object.keys(designer.socialLinks).length > 0 && (
              <Card className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-slate-900">Social Links</h2>
                <div className="space-y-2">
                  {Object.entries(designer.socialLinks).map(([platform, link]) => {
                    if (!link) return null;
                    return (
                      <div key={platform}>
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-blue-600 hover:underline text-sm capitalize"
                        >
                          {platform}: {link}
                        </a>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Member Info Card */}
            <Card className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-3 text-lg font-semibold text-slate-900">Member Info</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <label className="block font-medium text-slate-700">Member Since</label>
                  <p className="mt-1 text-slate-600">{formatDate(designer.createdAt)}</p>
                </div>
                {designer.updatedAt && (
                  <div>
                    <label className="block font-medium text-slate-700">Last Updated</label>
                    <p className="mt-1 text-slate-600">{formatDate(designer.updatedAt)}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Actions Card */}
            {designer.status !== "approved" && designer.status !== "rejected" && (
              <Card className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold text-slate-900">Actions</h3>
                <div className="space-y-3">
                  <Button
                    onClick={handleApprove}
                    disabled={updating}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium"
                  >
                    {updating ? "Processing..." : "✓ Approve Designer"}
                  </Button>
                  <Button
                    onClick={handleDeny}
                    disabled={updating}
                    variant="destructive"
                    className="w-full font-medium"
                  >
                    {updating ? "Processing..." : "✗ Reject Designer"}
                  </Button>
                </div>
              </Card>
            )}

            {(designer.status === "approved" || designer.status === "rejected") && (
              <Card className="rounded-xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
                <p className="text-sm text-slate-600">
                  This designer has been <span className="font-semibold">{designer.status}</span>. No further actions available.
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
