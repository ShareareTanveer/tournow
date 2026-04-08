"use client";

import { useState } from "react";
import InquiryModal from "@/components/modals/InquiryModal";

interface PackageInquirySectionProps {
  packageId: string;
  packageTitle: string;
}

export default function PackageInquirySection({
  packageId,
  packageTitle,
}: PackageInquirySectionProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="px-5 pb-5">
        <div className="relative flex items-center gap-1 my-1">
          <div className="flex-1 border-t border-gray-100" />
          <div className="flex-1 border-t border-gray-100" />
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 
             border-brand text-brand border
             hover:opacity-90 hover:shadow-md 
             active:scale-[0.98]"
        >
          Send Inquiry
        </button>
      </div>

      <InquiryModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        packageId={packageId}
        packageTitle={packageTitle}
      />
    </>
  );
}
