"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface KeyGenerationFormProps {
  onKeyGenerated: (data: any) => void
}

export function KeyGenerationForm({ onKeyGenerated }: KeyGenerationFormProps) {
  const [sender, setSender] = useState("")
  const [receiver, setReceiver] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("http://localhost:5000/api/generate_key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sender, receiver }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate key")
      }

      onKeyGenerated(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="sender">Sender UPI ID</Label>
          <Input
            id="sender"
            placeholder="user@bank"
            value={sender}
            onChange={(e) => setSender(e.target.value)}
            required
            className="bg-slate-900 border-slate-700"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="receiver">Receiver UPI ID</Label>
          <Input
            id="receiver"
            placeholder="merchant@bank"
            value={receiver}
            onChange={(e) => setReceiver(e.target.value)}
            required
            className="bg-slate-900 border-slate-700"
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating Quantum Key...
          </>
        ) : (
          "Generate Quantum Key"
        )}
      </Button>
    </form>
  )
}

