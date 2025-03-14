import type React from "react"
export default function ApiDocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="bg-white text-black min-h-screen">{children}</div>
}

