'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { ResiLogRecord } from '@/types/resi'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function HistoryPage() {
  const supabase = createClient()
  const [logs, setLogs] = useState<ResiLogRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchHistory() {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('resi_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) console.error(error)
      else setLogs(data || [])
      setIsLoading(false)
    }

    fetchHistory()
  }, [])

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800">Riwayat Process Resi</h1>
            <p className="text-sm text-slate-500 mt-0.5">Catatan resi yang berhasil di-rename & backup ke Google Drive</p>
          </div>
          <Link href="/">
            <Button variant="outline" size="sm" className="bg-white">
              ⬅ Kembali ke Generator
            </Button>
          </Link>
        </div>

        {/* Tabel Data */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Nama File Baru</TableHead>
                <TableHead>Pembeli</TableHead>
                <TableHead>Kode / Warna</TableHead>
                <TableHead>Catatan</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                    Memuat data riwayat...
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                    Belum ada riwayat transaksi resi.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-xs">{log.order_date}</TableCell>
                    <TableCell className="font-medium text-slate-800">{log.generated_filename}</TableCell>
                    <TableCell>{log.buyer_name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className="bg-slate-100 text-slate-700">
                          {log.product_code}
                        </Badge>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {log.variant_color}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-slate-500 max-w-[200px] truncate">
                      {log.notes || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {log.drive_file_url ? (
                        <a href={log.drive_file_url} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                            📂 Buka Drive
                          </Button>
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </main>
  )
}
