import { NextRequest, NextResponse } from "next/server";

// GET /api/department-courses
export async function GET() {
  try {
    // TODO: Replace with your DB query
    const courses = [
      {
        id: 1,
        course: "CS101",
        semester: "Term 01",
        creditHour: "3",
        level: "1",
        type: "mandatory",
        optionalCode: "Term 01",
        passDegree: "50",
        numberOfGroups: "2",
        maxDegree: "100",
        fieldName: "midterm",
        dynamicFields: [],
      },
    ];

    return NextResponse.json({ success: true, data: courses }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}

// POST /api/department-courses
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      course, semester, creditHour, level, type,
      optionalCode, passDegree, numberOfGroups,
      maxDegree, fieldName, dynamicFields,
    } = body;

    if (!course) {
      return NextResponse.json(
        { success: false, message: "Course is required" },
        { status: 400 }
      );
    }

    // TODO: Save to DB

    const savedCourse = {
      id: Date.now(),
      course, semester,
      creditHour: Number(creditHour),
      level, type, optionalCode,
      passDegree: Number(passDegree),
      numberOfGroups: Number(numberOfGroups),
      maxDegree: Number(maxDegree),
      fieldName, dynamicFields,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(
      { success: true, message: "Course saved successfully", data: savedCourse },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to save course" },
      { status: 500 }
    );
  }
}

// PUT /api/department-courses
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Course ID is required" },
        { status: 400 }
      );
    }

    // TODO: Update in DB

    return NextResponse.json(
      { success: true, message: "Course updated successfully", data: { id, ...updateData } },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to update course" },
      { status: 500 }
    );
  }
}

// DELETE /api/department-courses?id=1
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Course ID is required" },
        { status: 400 }
      );
    }

    // TODO: Delete from DB

    return NextResponse.json(
      { success: true, message: "Course deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to delete course" },
      { status: 500 }
    );
  }
}
