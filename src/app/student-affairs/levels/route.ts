import { NextRequest, NextResponse } from "next/server";

// GET /api/levels
export async function GET() {
  try {
    // TODO: Replace with your DB query
    const levels = [
      {
        id: 1,
        title: "Level One",
        badge: "100 Room",
        semesters: [
          {
            id: 1,
            title: "Semseter 01",
            badge: "100 Room",
            rows: [
              { id: 1, name: "John Dee", min: "10", max: "100" },
              { id: 2, name: "John Dee", min: "10", max: "100" },
            ],
          },
          { id: 2, title: "Semseter 02", badge: "100 Room", rows: [] },
          { id: 3, title: "Semseter 03", badge: "100 Room", rows: [] },
        ],
      },
      { id: 2, title: "Level Two", badge: "100 Room", semesters: [] },
      { id: 3, title: "Level Three", badge: "100 Room", semesters: [] },
    ];

    return NextResponse.json({ success: true, data: levels }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch levels" },
      { status: 500 }
    );
  }
}

// POST /api/levels
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, badge } = body;

    if (!title) {
      return NextResponse.json(
        { success: false, message: "Title is required" },
        { status: 400 }
      );
    }

    // TODO: save to DB

    return NextResponse.json(
      {
        success: true,
        message: "Level created",
        data: { id: Date.now(), title, badge, semesters: [] },
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to create level" },
      { status: 500 }
    );
  }
}
