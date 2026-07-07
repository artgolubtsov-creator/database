import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { DemoRoleProvider } from "@/lib/demo-role-context"
import { Shell } from "@/components/Shell"
import { auth } from "@/auth"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "update — Brand Content Hub",
  description: "Internal brand asset management",
  robots: { index: false, follow: false },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full">
        <DemoRoleProvider>
          <Shell userName={session?.user?.name} userRole={session?.user?.role}>
            {children}
          </Shell>
        </DemoRoleProvider>
      </body>
    </html>
  )
}
