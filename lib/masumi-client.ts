interface QuoteRequest {
  sendAmount: number
  recipientCountry: string
}

interface TransactionRequest {
  quoteId: string
  senderAddress: string
  recipientPhone: string
  sendAmount: number
}

interface PaymentRequest {
  massumiTxId: string
  cardanoTxHash: string
}

export class MasumiClient {
  private baseUrl = "/api/masumi"

  async getQuote(request: QuoteRequest) {
    console.log("[v0] Requesting Masumi quote:", request)
    const res = await fetch(`${this.baseUrl}/quote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    })
    return res.json()
  }

  async createTransaction(request: TransactionRequest) {
    console.log("[v0] Creating Masumi transaction:", request)
    const res = await fetch(`${this.baseUrl}/transaction`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    })
    return res.json()
  }

  async submitPayment(request: PaymentRequest) {
    console.log("[v0] Submitting Masumi payment:", request)
    const res = await fetch(`${this.baseUrl}/payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    })
    return res.json()
  }

  async getStatus(txId: string) {
    console.log("[v0] Checking Masumi transaction status:", txId)
    const res = await fetch(`${this.baseUrl}/status?txId=${txId}`)
    return res.json()
  }
}

export const masumiClient = new MasumiClient()
