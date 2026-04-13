import { Camera } from "lucide-react";

const STATIC_PROFILE = {
  subtitle: "JPG, PNG or GIF, Max size 2MB",
  initials: "TA",
};

export default function ProfilePicturePage() {
  return (
    <main className="h-full w-full">
      <section className="h-full w-full rounded-[18px] border border-[#e9ebf1] bg-white p-4 sm:p-6">
        <h1 className="text-[20px] font-bold text-[#0f172a]">Profile Picture</h1>

        <div className="mt-5 rounded-[14px] border border-[#e9ebf1] bg-[#fcfcfd] px-4 py-3 sm:px-5 sm:py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-blue-500 to-violet-500 text-sm font-semibold text-white">
                {STATIC_PROFILE.initials}
                <div className="absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full border border-white bg-[#0f172a] text-white">
                  <Camera className="h-3 w-3" />
                </div>
              </div>

              <div className="space-y-0.5">
                <button
                  type="button"
                  className="cursor-pointer text-left text-[13px] font-semibold text-[#0f172a]"
                >
                  Change Photo
                </button>
                <p className="text-[11px] text-[#94a3b8]">{STATIC_PROFILE.subtitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                className="cursor-pointer rounded-full bg-[#111827] px-4 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-[#1f2937]"
              >
                Edit
              </button>
              <button
                type="button"
                className="cursor-pointer rounded-full bg-[#ef4444] px-4 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-[#dc2626]"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
