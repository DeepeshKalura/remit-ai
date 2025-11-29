export async function POST(request: Request) {
  try {
    const { quoteId, senderAddress, recipientPhone, sendAmount } = await request.json()

    if (!quoteId || !senderAddress || !sendAmount) {
      return Response.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Mock Masumi transaction initiation
    const txId = `masumi_${Date.now()}_${Math.random().toString(36).slice(7)}`

    return Response.json({
      success: true,
      transaction: {
        id: txId,
        quoteId,
        status: "pending_payment",
        senderAddress,
        recipientPhone,
        sendAmount,
        createdAt: new Date().toISOString(),
        paymentEndpoint: `https://testnet.masumi.io/pay/${txId}`,
        message: "Transaction created. Ready for payment authorization.",
      },
    })
  } catch (error) {
    console.error("[Masumi API] Transaction error:", error)
    return Response.json({ success: false, error: "Failed to create transaction" }, { status: 500 })
  }
}
