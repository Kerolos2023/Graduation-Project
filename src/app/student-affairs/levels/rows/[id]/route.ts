import { NextRequest, NextResponse } from "next/server";

// PUT /api/levels/rows/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const body = await req.json();
    const { name, min, max } = body;

    if (!name  !max) {
      return NextResponse.json(
        { success: false, message: "name, min, and max are required" },
        { status: 400 }
      );
    }

    // TODO: update in DB

    return NextResponse.json(
      { success: true, message: "Row updated", data: { id, name, min, max } },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to update row" },
      { status: 500 }
    );
  }
}

// DELETE /api/levels/rows/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);

    // TODO: delete from DB

    return NextResponse.json(
      { success: true, message: "Row deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to delete row" },
      { status: 500 }
    );
  }
}
