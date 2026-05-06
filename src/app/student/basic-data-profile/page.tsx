"use client";

import { useEffect, useState } from "react";
import { studentProfileService } from "@/services/studentProfile.service";
import { COLLEGE_ID as collegeId } from "@/lib/constants";

type FieldProps = {
  title: string;
  value: string | number | null | undefined;
};

function Field({ title, value }: FieldProps) {
  return (
    <div>
      <p className="text-xs text-gray-500 mb-1">{title}</p>
      <div className="bg-gray-100 rounded-lg px-3 py-2 text-sm break-words">
        {value ?? "-"}
      </div>
    </div>
  );
}

export default function StudentProfileView() {


  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await studentProfileService.getAllData();
        setData(data);
      } catch (err) {
        console.error("API Error:", err);
        setError("Failed to load student data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p className="p-4 sm:p-6">Loading...</p>;
  if (error) return <p className="p-4 sm:p-6 text-red-500">{error}</p>;
  if (!data) return <p className="p-4 sm:p-6">No data found</p>;

  return (
    <div className="p-3 sm:p-6 space-y-6">

      {/* Personal */}
      <div className="bg-gray-50 p-3 sm:p-4 rounded-xl border space-y-4">
        <h2 className="font-semibold text-sm sm:text-base">Personal data</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field title="Name" value={data?.personal?.name} />
          <Field title="Student Code" value={data?.personal?.studentCode} />
          <Field title="National ID" value={data?.personal?.nationalIdOrPassport} />
          <Field title="Nationality" value={data?.personal?.nationality} />
          <Field title="Place of Birth" value={data?.personal?.placeOfBirth} />
        </div>
      </div>

      {/* Family */}
      <div className="bg-gray-50 p-3 sm:p-4 rounded-xl border space-y-4">
        <h2 className="font-semibold text-sm sm:text-base">Family Data</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field title="Guardian Name" value={data?.parent?.guardianName} />
          <Field title="Relationship" value={data?.parent?.relationshipDegree} />
          <Field title="Job" value={data?.parent?.job} />
          <Field title="Mother Name" value={data?.parent?.motherName} />
          <Field title="City" value={data?.parent?.guardianCity} />
          <Field title="Phone" value={data?.parent?.guardianPhoneNumber} />
        </div>
      </div>

      {/* Contact */}
      <div className="bg-gray-50 p-3 sm:p-4 rounded-xl border space-y-4">
        <h2 className="font-semibold text-sm sm:text-base">Contact Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field title="City" value={data?.contact?.city} />
          <Field title="Address" value={data?.contact?.address} />
          <Field title="Postal Code" value={data?.contact?.postalCode} />
          <Field title="Phone" value={data?.contact?.phoneNumber} />
          <Field title="Email" value={data?.contact?.email} />
        </div>
      </div>

      {/* Military */}
      <div className="bg-gray-50 p-3 sm:p-4 rounded-xl border space-y-4">
        <h2 className="font-semibold text-sm sm:text-base">Military Data</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field title="Status" value={data?.military?.militaryStatus} />
          <Field title="Military Number" value={data?.military?.militaryNumber} />
          <Field title="Decision Number" value={data?.military?.decisionNumber} />
          <Field title="Decision Date" value={data?.military?.decisionDate} />
          <Field title="End Date" value={data?.military?.endDate} />
        </div>
      </div>

      {/* Qualification */}
      <div className="bg-gray-50 p-3 sm:p-4 rounded-xl border space-y-4">
        <h2 className="font-semibold text-sm sm:text-base">Previous Qualification</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field title="School Name" value={data?.qualification?.schoolName} />
          <Field title="Enrollment Year" value={data?.qualification?.enrollmentYear} />
          <Field title="Seat Number" value={data?.qualification?.seatNumber} />
          <Field title="Qualification" value={data?.qualification?.qualification} />
          <Field title="Graduation Year" value={data?.qualification?.graduationYear} />
          <Field title="Total Grade" value={data?.qualification?.totalGrade} />
        </div>
      </div>

    </div>
  );
}