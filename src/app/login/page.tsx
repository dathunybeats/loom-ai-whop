import Link from "next/link"
import { LoginForm } from "@/components/login-form"
import { Suspense } from "react"
import Image from "next/image"

function LoginFormFallback() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link href="/" className="flex items-center gap-2 self-center font-medium">
          <Image
            src="/Component 1.svg"
            alt="Meraki Reach Logo"
            width={32}
            height={32}
            className="h-8 w-8"
          />
          Meraki Reach
        </Link>
        <Suspense fallback={<LoginFormFallback />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
