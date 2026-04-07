export async function POST(req) {
  try {
    const body = await req.json();

    const res = await fetch(
      ${process.env.API_URL}/programs/1/course-offerings,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    let data;
    try {
      data = await res.json();
    } catch {
      data = { message: "Invalid JSON response" };
    }

    if (!res.ok) {
      return Response.json(
        { message: data.message || "Backend error" },
        { status: res.status }
      );
    }

    return Response.json(data, { status: 200 });
  } catch (error) {
    return Response.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}




















































































