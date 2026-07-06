import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { DemoRoleProvider } from "@/lib/demo-role-context"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "update — Brand Content Hub",
  description: "Internal brand asset management",
  robots: { index: false, follow: false },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full">
        <DemoRoleProvider>{children}</DemoRoleProvider>
      </body>
    </html>
  )
}
