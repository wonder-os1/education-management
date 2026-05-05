'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { Plus, Search, IndianRupee } from 'lucide-react'
import { formatDate, formatCurrency, getStatusColor } from '@/lib/utils'
import type { Fee, PaginatedResponse } from '@/types'

export default function FeesPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [showCollect, setShowCollect] = useState(false)
  const [selectedFee, setSelectedFee] = useState<Fee | null>(null)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('CASH')

  const { data, isLoading } = useQuery<PaginatedResponse<Fee>>({
    queryKey: ['fees', page, search, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ page: page.toString(), limit: '20' })
      if (search) params.set('search', search)
      if (statusFilter) params.set('status', statusFilter)
      const { data } = await api.get(`/fees?${params}`)
      return data
    },
  })

  const collectMutation = useMutation({
    mutationFn: (payload: { feeId: string; amount: number; method: string }) =>
      api.post(`/fees/${payload.feeId}/pay`, { amount: payload.amount, method: payload.method }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fees'] })
      setShowCollect(false)
      setSelectedFee(null)
      toast({ title: 'Payment collected successfully' })
    },
    onError: (err: any) => { toast({ variant: 'destructive', title: 'Error', description: err.response?.data?.message || 'Failed' }) },
  })

  const fees = data?.data || []
  const pagination = data?.pagination

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Fee Management</h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search by student name..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} className="pl-10" />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v === 'all' ? '' : v); setPage(1) }}>
              <SelectTrigger className="w-40"><SelectValue placeholder="All Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="OVERDUE">Overdue</SelectItem>
                <SelectItem value="PARTIAL">Partial</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="h-12 animate-pulse rounded bg-muted" />)}</div>
          ) : fees.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No fee records found</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fees.map((fee) => (
                    <TableRow key={fee.id}>
                      <TableCell className="font-medium">{fee.student?.user?.name || '-'}</TableCell>
                      <TableCell><Badge variant="secondary">{fee.type}</Badge></TableCell>
                      <TableCell>{formatCurrency(fee.amount)}</TableCell>
                      <TableCell>{formatCurrency(fee.paidAmount)}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(fee.amount - fee.paidAmount)}</TableCell>
                      <TableCell>{formatDate(fee.dueDate)}</TableCell>
                      <TableCell><Badge className={getStatusColor(fee.status)} variant="outline">{fee.status}</Badge></TableCell>
                      <TableCell>
                        {fee.status !== 'PAID' && (
                          <Button size="sm" variant="outline" onClick={() => {
                            setSelectedFee(fee)
                            setPaymentAmount(((fee.amount - fee.paidAmount) / 100).toString())
                            setShowCollect(true)
                          }}>
                            <IndianRupee className="mr-1 h-3 w-3" /> Collect
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {pagination && pagination.pages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">Page {pagination.page} of {pagination.pages}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
                    <Button variant="outline" size="sm" disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)}>Next</Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={showCollect} onOpenChange={setShowCollect}>
        <DialogContent>
          <DialogHeader><DialogTitle>Collect Payment</DialogTitle></DialogHeader>
          {selectedFee && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-4 text-sm space-y-1">
                <p><strong>Student:</strong> {selectedFee.student?.user?.name}</p>
                <p><strong>Fee Type:</strong> {selectedFee.type}</p>
                <p><strong>Total:</strong> {formatCurrency(selectedFee.amount)}</p>
                <p><strong>Already Paid:</strong> {formatCurrency(selectedFee.paidAmount)}</p>
                <p><strong>Balance:</strong> {formatCurrency(selectedFee.amount - selectedFee.paidAmount)}</p>
              </div>
              <div className="space-y-2">
                <Label>Amount (INR) *</Label>
                <Input type="number" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                    <SelectItem value="CHEQUE">Cheque</SelectItem>
                    <SelectItem value="ONLINE">Online</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCollect(false)}>Cancel</Button>
                <Button onClick={() => collectMutation.mutate({ feeId: selectedFee.id, amount: parseFloat(paymentAmount) * 100, method: paymentMethod })} disabled={collectMutation.isPending}>
                  {collectMutation.isPending ? 'Processing...' : 'Collect Payment'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
