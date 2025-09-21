import Link from "next/link"
import { SignupForm } from "@/components/signup-form"
import Image from "next/image"

export default function SignupPage() {
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
        <SignupForm />
      </div>
    </div>
  )
}