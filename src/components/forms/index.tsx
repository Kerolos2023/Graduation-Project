"use client";

import { useStudentContext } from "@/hooks/useStudentContext";
import { HeaderNavigation } from "@/components/layout/HeaderNavStudents";
import ProfileHeader from "@/components/layout/ProfileHeader";

import PersonalData from "./personal-data";
import ParentData from "./parent-data";
import ContactInformation from "./contact-information";
import MilitaryData from "./miilitary-data";
import QualificationData from "./qualification-data";

export default function StudentFormsPopup() {
  const { activeTab, isEditPopupOpen, setIsEditPopupOpen } =
    useStudentContext();

  if (!isEditPopupOpen) return null;

  const renderStep = () => {
    switch (activeTab) {
      case "personal":
        return <PersonalData />;
      case "parent":
        return <ParentData />;
      case "contact":
        return <ContactInformation />;
      case "military":
        return <MilitaryData />;
      case "qualification":
        return <QualificationData />;
      default:
        return <PersonalData />;
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex justify-center items-start p-4 z-50 overflow-y-auto"
      onClick={() => setIsEditPopupOpen(false)}   // 👈 click outside closes popup
    >
      <div
        className="w-full max-w-[1100px] mt-10 bg-gray-100 rounded-[20px] p-8 shadow-sm relative"
        onClick={(e) => e.stopPropagation()} // 👈 prevent close when clicking inside
      >
        {/* CLOSE */}
        <div className="flex justify-end absolute top-4 right-4">
          <button
            onClick={() => setIsEditPopupOpen(false)}
            className="text-gray-500 hover:text-red-500 text-lg"
          >
            ✕
          </button>
        </div>

        <div className="mb-4">
          <HeaderNavigation />
        </div>

        <ProfileHeader />

        {/* ✅ here only content */}
        <div className="mt-6">{renderStep()}</div>
      </div>
    </div>
  );
}