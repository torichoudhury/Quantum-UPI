"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { KeyGenerationForm } from "@/components/key-generation-form"
import { TransactionForm } from "@/components/transaction-form"
import { TransactionStatus } from "@/components/transaction-status"
import { QuantumVisualization } from "@/components/quantum-visualization"
import { TransactionDetails } from "@/components/transaction-details"

export function QuantumUpiSimulator() {
  const [activeTab, setActiveTab] = useState("generate")
  const [transactionId, setTransactionId] = useState<string | null>(null)
  const [qkdDetails, setQkdDetails] = useState<any>(null)
  const [transactionDetails, setTransactionDetails] = useState<any>(null)

  const handleKeyGenerated = (data: any) => {
    setTransactionId(data.transaction_id)
    setQkdDetails(data.qkd_details)
    setActiveTab("process")
  }

  const handleTransactionProcessed = (data: any) => {
    setTransactionDetails(data)
    setActiveTab("status")
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle>Quantum UPI Transaction</CardTitle>
            <CardDescription className="text-slate-400">
              Secure your transactions with quantum cryptography
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="generate">Generate Key</TabsTrigger>
                <TabsTrigger value="process" disabled={!transactionId}>
                  Process Transaction
                </TabsTrigger>
                <TabsTrigger value="status" disabled={!transactionDetails}>
                  Transaction Status
                </TabsTrigger>
              </TabsList>
              <TabsContent value="generate">
                <KeyGenerationForm onKeyGenerated={handleKeyGenerated} />
              </TabsContent>
              <TabsContent value="process">
                <TransactionForm transactionId={transactionId} onTransactionProcessed={handleTransactionProcessed} />
              </TabsContent>
              <TabsContent value="status">
                <TransactionStatus transactionId={transactionId} transactionDetails={transactionDetails} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      <div>
        <div className="space-y-6">
          {qkdDetails && (
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle>Quantum Key Visualization</CardTitle>
                <CardDescription className="text-slate-400">BB84 Protocol in action</CardDescription>
              </CardHeader>
              <CardContent>
                <QuantumVisualization qkdDetails={qkdDetails} />
              </CardContent>
            </Card>
          )}

          {transactionDetails && (
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle>Transaction Details</CardTitle>
              </CardHeader>
              <CardContent>
                <TransactionDetails details={transactionDetails} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

