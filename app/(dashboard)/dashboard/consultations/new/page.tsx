import { Suspense } from 'react'
import NewConsultationPage from '@/components/clinic/newConsultationClient'

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[50vh] items-center justify-center">
          Loading...
        </div>
      }
    >
      <NewConsultationPage />
    </Suspense>
  )
}