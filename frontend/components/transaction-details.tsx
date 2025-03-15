"use client"

interface TransactionDetailsProps {
  details: {
    transaction_id: string
    status: string
    encrypted_data_length: number
    simulation: {
      original_message: string
      encrypted_sample: string
      decryption_successful: boolean
    }
  }
}

export function TransactionDetails({ details }: TransactionDetailsProps) {
  if (!details) return null

  const { transaction_id, status, encrypted_data_length, simulation } = details

  return (
    <div className="space-y-4 text-sm">
      <div className="grid grid-cols-2 gap-2">
        <div className="text-slate-400">Encryption:</div>
        <div className="font-mono text-green-400">Successful</div>

        <div className="text-slate-400">Encrypted Length:</div>
        <div>{encrypted_data_length} bytes</div>

        <div className="text-slate-400">Decryption:</div>
        <div className={simulation.decryption_successful ? "font-mono text-green-400" : "font-mono text-red-400"}>
          {simulation.decryption_successful ? "Successful" : "Failed"}
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-slate-400">Original Message:</div>
        <div className="bg-slate-900 p-2 rounded font-mono text-xs overflow-x-auto">{simulation.original_message}</div>

        <div className="text-slate-400">Encrypted Sample:</div>
        <div className="bg-slate-900 p-2 rounded font-mono text-xs overflow-x-auto">
          {simulation.encrypted_sample}...
        </div>
      </div>
    </div>
  )
}

