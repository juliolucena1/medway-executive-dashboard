import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

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
        {/* Meta tags essenciais */}
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* CSS inline para garantir que todas as páginas tenham pelo menos estilo básico */}
        <style>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: system-ui, -apple-system, sans-serif;
            background-color: #111827;
            color: white;
            min-height: 100vh;
          }
          
          .page-container {
            min-height: 100vh;
            background-color: #111827;
            color: white;
            padding: 2rem;
          }
          
          .max-w-container {
            max-width: 1280px;
            margin: 0 auto;
          }
          
          /* Gradientes para títulos */
          .gradient-title {
            background: linear-gradient(to right, #c084fc, #60a5fa);
            background-clip: text;
            -webkit-background-clip: text;
            color: transparent;
          }
          
          /* Cards básicos */
          .card {
            background: linear-gradient(135deg, #1f2937, #111827);
            border-radius: 16px;
            padding: 1.5rem;
            border: 1px solid #374151;
            margin-bottom: 1rem;
          }
          
          /* Botões básicos */
          .btn {
            padding: 0.75rem 1.5rem;
            border-radius: 12px;
            font-weight: 500;
            border: none;
            cursor: pointer;
            transition: all 0.2s;
            text-decoration: none;
            display: inline-block;
            text-align: center;
          }
          
          .btn-primary {
            background-color: #7c3aed;
            color: white;
          }
          
          .btn-primary:hover {
            background-color: #6d28d9;
          }
          
          .btn-secondary {
            background-color: #374151;
            color: #d1d5db;
          }
          
          .btn-secondary:hover {
            background-color: #4b5563;
          }
          
          /* Grid responsivo */
          .grid {
            display: grid;
            gap: 1.5rem;
          }
          
          .grid-cols-auto {
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          }
          
          /* Texto colorido */
          .text-purple { color: #c084fc; }
          .text-green { color: #10b981; }
          .text-yellow { color: #fbbf24; }
          .text-blue { color: #60a5fa; }
          .text-gray { color: #9ca3af; }
          .text-red { color: #ef4444; }
          
          /* Responsive */
          @media (max-width: 768px) {
            .page-container {
              padding: 1rem;
            }
            
            .grid {
              gap: 1rem;
            }
          }
        `}</style>
      </head>
      <body className={inter.className}>
        <div className="page-container">
          <div className="max-w-container">
            {children}
          </div>
        </div>
      </body>
    </html>
  )
}
