"use client"

import { CardanoWallet } from "@meshsdk/react"

export default function ConnectWalletButton() {
    return (
        <div className="flex items-center justify-center">
            <CardanoWallet />
        </div>
    )
}
