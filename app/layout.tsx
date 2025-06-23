import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MEDWAY Executive Dashboard',
  description: 'Dashboard de Análise de Produtividade dos Terapeutas',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <style>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #111827;
            color: white;
            line-height: 1.5;
          }
          
          html, body {
            height: 100%;
          }
        `}</style>
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
