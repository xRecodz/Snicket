import { Suspense } from "react"
import CheckinPage from "./CheckinPage"

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckinPage />
    </Suspense>
  )
}
