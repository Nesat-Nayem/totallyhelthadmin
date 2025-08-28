import Invoice, { InvoiceOrder } from '../components/Invoice'
import { getServerSession } from 'next-auth'
import { options as authOptions } from '@/app/api/auth/[...nextauth]/options'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001/api/v1'

async function getOrder(id: string) {
  const session = await getServerSession(authOptions as any)
  const token = (session as any)?.user?.token
  const res = await fetch(`${API_BASE}/orders/${id}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: 'no-store',
  })
  if (!res.ok) {
    throw new Error(`Failed to load order: ${res.status}`)
  }
  const data = await res.json()
  return data?.data
}

export default async function Page({ params }: { params: { id: string } }) {
  const order = await getOrder(params.id)

  const mapped: InvoiceOrder = {
    invoiceNo: order?.invoiceNo ?? '-',
    date: order?.date ?? new Date().toISOString(),
    customer: order?.customer ? { id: order.customer.id, name: order.customer.name } : undefined,
    items: (order?.items || []).map((it: any) => ({ id: it.productId, title: it.title, price: it.price, qty: it.qty })),
    subTotal: order?.subTotal ?? 0,
    total: order?.total ?? 0,
    vatPercent: order?.vatPercent ?? 0,
    vatAmount: order?.vatAmount ?? 0,
    discountType: order?.discountType ?? 'flat',
    discountAmount: order?.discountAmount ?? 0,
    shippingCharge: order?.shippingCharge ?? 0,
    rounding: order?.rounding ?? 0,
    payableAmount: order?.payableAmount ?? order?.total ?? 0,
    receiveAmount: order?.receiveAmount ?? 0,
    changeAmount: order?.changeAmount ?? 0,
    dueAmount: order?.dueAmount ?? 0,
    paymentMode: order?.paymentMode ?? 'Cash',
  }

  return <Invoice order={mapped} />
}
