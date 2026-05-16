import { Suspense } from 'react'
import NewInvoicePage from '@/components/clinic/newInvoiceClient'

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[50vh] items-center justify-center">
          Loading...
        </div>
      }
    >
      <NewInvoicePage />
    </Suspense>
  )
}