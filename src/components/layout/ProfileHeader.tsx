import React from 'react'
import Link from 'next/link'
function ProfileHeader() {
  return (
    <div>
                    <div className="bg-white p-4 rounded-2xl shadow mb-4">
              <h2 className="text-lg font-semibold mb-4">Profile Picture</h2>

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center text-sm font-semibold">
                    kero
                  </div>

                  <div>
                    <Link href="" className="text-blue-600 font-medium">
                      Change Photo
                    </Link>
                    <p className="text-sm text-gray-500">
                      JPG, PNG or GIF, Max size 2GB
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="bg-black text-white px-4 py-2 rounded-full cursor-pointer"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="bg-red-600 text-white px-4 py-2 rounded-full cursor-pointer"
                  >
                    Delete
                  </button>

                  <button
                    type="button"
                    className="bg-gray-200 px-4 py-2 rounded-full cursor-pointer"
                  >
                    Request to change the image
                  </button>
                </div>
              </div>
            </div>
    </div>
  )
}

export default ProfileHeader