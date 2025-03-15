"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface TransactionStatusProps {
  transactionId: string | null
  transactionDetails: any
}

export function TransactionStatus({ transactionId, transactionDetails }: TransactionStatusProps) {
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (transactionDetails) {
      setStatus(transactionDetails)
    } else if (transactionId) {
      fetchStatus()
    }
  }, [transactionId, transactionDetails])

  const fetchStatus = async () => {
    if (!transactionId) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`http://localhost:5000/api/transaction_status/${transactionId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch transaction status")
      }

      setStatus(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!status) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No transaction data</AlertTitle>
        <AlertDescription>No transaction information available</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Transaction Status</h3>
        <Badge variant={status.status === "completed" ? "default" : "secondary"} className="text-xs">
          {status.status}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="text-slate-400">Transaction ID:</div>
        <div>{status.transaction_id}</div>

        {status.details && (
          <>
            <div className="text-slate-400">Sender:</div>
            <div>{status.details.sender}</div>

            <div className="text-slate-400">Receiver:</div>
            <div>{status.details.receiver}</div>

            {status.details.amount && (
              <>
                <div className="text-slate-400">Amount:</div>
                <div>₹{status.details.amount.toFixed(2)}</div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

