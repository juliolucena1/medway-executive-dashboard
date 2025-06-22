import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MEDWAY Executive Dashboard',
  description: 'Dashboard Executivo de Análise de Terapeutas',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
