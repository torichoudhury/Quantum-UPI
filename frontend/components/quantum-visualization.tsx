"use client"

import { useEffect, useRef } from "react"

interface QuantumVisualizationProps {
  qkdDetails: {
    alice_bits: number[]
    alice_bases: string[]
    bob_bases: string[]
    bob_results: number[]
    shared_key: number[]
  }
}

export function QuantumVisualization({ qkdDetails }: QuantumVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || !qkdDetails) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set dimensions
    const width = canvas.width
    const height = canvas.height
    const margin = 20
    const itemWidth = (width - 2 * margin) / Math.min(qkdDetails.alice_bits.length, 20)
    const rowHeight = 30

    // Draw title
    ctx.fillStyle = "#f8fafc"
    ctx.font = "14px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText("BB84 Protocol Visualization (First 20 bits)", width / 2, margin)

    // Draw rows
    const drawRow = (
      y: number,
      label: string,
      data: (number | string)[],
      colorFn: (item: number | string, index: number) => string,
    ) => {
      // Draw label
      ctx.fillStyle = "#94a3b8"
      ctx.font = "12px sans-serif"
      ctx.textAlign = "right"
      ctx.fillText(label, margin - 5, y + 4)

      // Draw data
      for (let i = 0; i < Math.min(data.length, 20); i++) {
        const x = margin + i * itemWidth
        ctx.fillStyle = colorFn(data[i], i)
        ctx.fillRect(x, y - 10, itemWidth - 2, 20)

        ctx.fillStyle = "#000"
        ctx.font = "10px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText(data[i].toString(), x + itemWidth / 2, y + 4)
      }
    }

    // Draw Alice's bits
    drawRow(margin + rowHeight, "Alice bits:", qkdDetails.alice_bits, () => "#3b82f6")

    // Draw Alice's bases
    drawRow(margin + rowHeight * 2, "Alice bases:", qkdDetails.alice_bases, (base) =>
      base === "+" ? "#10b981" : "#f97316",
    )

    // Draw Bob's bases
    drawRow(margin + rowHeight * 3, "Bob bases:", qkdDetails.bob_bases, (base) =>
      base === "+" ? "#10b981" : "#f97316",
    )

    // Draw Bob's results
    drawRow(margin + rowHeight * 4, "Bob results:", qkdDetails.bob_results, () => "#8b5cf6")

    // Draw matching bases (highlight matches)
    drawRow(
      margin + rowHeight * 5,
      "Matches:",
      qkdDetails.alice_bases.map((base, i) => (base === qkdDetails.bob_bases[i] ? "✓" : "✗")),
      (match) => (match === "✓" ? "#22c55e" : "#ef4444"),
    )

    // Draw shared key
    const sharedKeyVisual = qkdDetails.alice_bases.map((base, i) => {
      if (base === qkdDetails.bob_bases[i]) {
        return qkdDetails.alice_bits[i]
      }
      return "-"
    })

    drawRow(margin + rowHeight * 6, "Shared key:", sharedKeyVisual, (bit) => (bit === "-" ? "#1e293b" : "#eab308"))
  }, [qkdDetails])

  return (
    <div className="space-y-4">
      <canvas ref={canvasRef} width={400} height={220} className="w-full bg-slate-900 rounded-md" />
      <div className="text-xs text-slate-400">
        <p>Key length: {qkdDetails.shared_key.length} bits</p>
        <p>
          Matching bases: {qkdDetails.shared_key.length}/{qkdDetails.alice_bits.length} (
          {((qkdDetails.shared_key.length / qkdDetails.alice_bits.length) * 100).toFixed(1)}%)
        </p>
      </div>
    </div>
  )
}

