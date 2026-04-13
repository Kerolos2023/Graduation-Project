import React from 'react'
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import CollegeDataTabs from "@/components/departmentsTabs";

const DepartmentDataPage = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">
        <CollegeDataTabs />
      
      
 
      <div className="space-y-6">
        {[1, 2].map((section) => (
          <Card key={section} className="border-none shadow-sm overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold text-gray-800">Department Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Department Name</Label>
                  <Input placeholder="Placeholder" className="bg-white border-gray-200 h-11" />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Department Code</Label>
                  <Input placeholder="Placeholder" className="bg-white border-gray-200 h-11" />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Conscription Decision Number</Label>
                  <Input placeholder="Placeholder" className="bg-white border-gray-200 h-11" />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Enlistment Date / Date of Joining</Label>
                  <Input placeholder="Placeholder" className="bg-white border-gray-200 h-11" />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold">End of Service Date / Discharge Date</Label>
                  <Input placeholder="Placeholder" className="bg-white border-gray-200 h-11" />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Reserve Service End Date</Label>
                  <Input placeholder="Placeholder" className="bg-white border-gray-200 h-11" />
                </div>

              </div>
            </CardContent>
          </Card>
        ))}
      </div>

   
      <div className="pt-4">
        <Button className="w-full bg-[#2563eb] hover:bg-blue-700 h-12 text-lg font-medium">
          Save
        </Button>
      </div>

    </div>
  )
}

export default DepartmentDataPage