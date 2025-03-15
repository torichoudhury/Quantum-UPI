import { QuantumUpiSimulator } from "@/components/quantum-upi-simulator"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-2">Quantum UPI Simulator</h1>
        <p className="text-center text-slate-300 mb-8">Secure transactions using Quantum Key Distribution</p>
        <QuantumUpiSimulator />
      </div>
    </main>
  )
}

