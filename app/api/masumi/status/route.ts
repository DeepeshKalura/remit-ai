export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const txId = searchParams.get("txId")

    if (!txId) {
      return Response.json({ success: false, error: "Transaction ID required" }, { status: 400 })
    }

    // Mock status check
    const statuses = ["pending_payment", "processing", "sent", "completed"]
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]

    return Response.json({
      success: true,
      status: {
        txId,
        status: randomStatus,
        lastUpdate: new Date().toISOString(),
        progress: Math.floor(Math.random() * 100),
      },
    })
  } catch (error) {
    console.error("[Masumi API] Status error:", error)
    return Response.json({ success: false, error: "Failed to fetch status" }, { status: 500 })
  }
}
