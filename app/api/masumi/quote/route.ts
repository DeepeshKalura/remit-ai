export async function POST(request: Request) {
  try {
    const { sendAmount, recipientCountry } = await request.json()

    // Mock Masumi quote response
    const mockRates: Record<string, number> = {
      philippines: 52.9,
      vietnam: 25565,
      india: 94.23,
      mexico: 17.85,
      kenya: 129.5,
    }

    const rate = mockRates[recipientCountry] || 1.12
    const feePercent = 0.5
    const fee = sendAmount * (feePercent / 100)
    const receiveAmount = (sendAmount - fee) * rate

    return Response.json({
      success: true,
      quote: {
        sendAmount,
        receiveAmount: Number.parseFloat(receiveAmount.toFixed(2)),
        exchangeRate: rate,
        fee: Number.parseFloat(fee.toFixed(4)),
        feePercent,
        recipientCountry,
        expiresIn: 300, // 5 minutes
        quoteId: `quote_${Date.now()}`,
      },
    })
  } catch (error) {
    console.error("[Masumi API] Quote error:", error)
    return Response.json({ success: false, error: "Failed to generate quote" }, { status: 500 })
  }
}
