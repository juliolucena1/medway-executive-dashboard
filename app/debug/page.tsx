// app/debug/page.tsx - Página de Debug (sem lucide-react)
'use client'

import { useState } from 'react'
import { testarConexao, listarTabelas, testarPermissoes } from '@/lib/supabase'
import { getDashboardMetrics } from '@/utils/dashboardAnalytics'

export default function DebugPage() {
  const [resultados, setResultados] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const executarTeste = async (tipoTeste: string) => {
    setLoading(true)
    setResultados(null)
    
    try {
      console.log(`🧪 Executando teste: ${tipoTeste}`)
      
      switch (tipoTeste) {
        case 'conexao':
          console.log('🧪 Testando conexão básica...')
          const resultadoConexao = await testarConexao()
          setResultados({ tipo: 'Teste de Conexão', dados: resultadoConexao })
          break
          
        case 'tabelas':
          console.log('🧪 Listando tabelas disponíveis...')
          const tabelas = await listarTabelas()
          setResultados({ tipo: 'Lista de Tabelas', dados: tabelas })
          break

        case 'permissoes':
          console.log('🧪 Testando permissões RLS...')
          const permissoes = await testarPermissoes()
          setResultados({ tipo: 'Teste de Permissões', dados: permissoes })
          break
          
        case 'metricas':
          console.log('🧪 Testando cálculo de métricas...')
          const metricas = await getDashboardMetrics('trimestre')
          setResultados({ tipo: 'Métricas Dashboard', dados: metricas })
          break

        case 'todos_dados':
          console.log('🧪 Testando TODOS os dados (sem limite)...')
          const todosDados = await getDashboardMetrics() // Sem período = todos os dados
          setResultados({ tipo: 'Teste TODOS os Dados', dados: todosDados })
          break
          
        default:
          setResultados({ tipo: 'Erro', dados: 'Tipo de teste desconhecido' })
      }
    } catch (error) {
      console.error('❌ Erro no teste:', error)
      setResultados({ 
        tipo: 'Erro', 
        dados: {
          erro: error instanceof Error ? error.message : 'Erro desconhecido',
          stack: error instanceof Error ? error.stack : undefined
        }
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-purple-400 mb-2">
            🔧 Debug - Conexão Supabase
          </h1>
          <p className="text-gray-400">
            Use esta página para testar e debugar a conexão com o Supabase
          </p>
        </div>

        {/* Environment Variables Check */}
        <div className="bg-gray-800 rounded-xl p-6 mb-6 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">📋 Environment Variables</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className={`w-4 h-4 rounded-full ${process.env.NEXT_PUBLIC_SUPABASE_URL ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="font-mono text-sm">NEXT_PUBLIC_SUPABASE_URL:</span>
              <span className="text-gray-300">
                {process.env.NEXT_PUBLIC_SUPABASE_URL || '❌ Não definida'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className={`w-4 h-4 rounded-full ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="font-mono text-sm">NEXT_PUBLIC_SUPABASE_ANON_KEY:</span>
              <span className="text-gray-300">
                {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY 
                  ? `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20)}...` 
                  : '❌ Não definida'
                }
              </span>
            </div>
          </div>
          
          {(!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) && (
            <div className="mt-4 p-4 bg-red-900/50 border border-red-500 rounded-lg">
              <p className="text-red-200 font-semibold">⚠️ Environment Variables não configuradas!</p>
              <p className="text-red-300 text-sm mt-2">
                Configure as variáveis no Vercel: Settings → Environment Variables
              </p>
            </div>
          )}
        </div>

        {/* Botões de Teste */}
        <div className="bg-gray-800 rounded-xl p-6 mb-6 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">🧪 Testes Disponíveis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            
            <button
              onClick={() => executarTeste('conexao')}
              disabled={loading}
              className="p-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-all disabled:opacity-50"
            >
              🔗 Conexão Básica
            </button>
            
            <button
              onClick={() => executarTeste('tabelas')}
              disabled={loading}
              className="p-4 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-all disabled:opacity-50"
            >
              📋 Listar Tabelas
            </button>

            <button
              onClick={() => executarTeste('permissoes')}
              disabled={loading}
              className="p-4 bg-orange-600 hover:bg-orange-700 rounded-lg font-medium transition-all disabled:opacity-50"
            >
              🔒 Permissões RLS
            </button>
            
            <button
              onClick={() => executarTeste('metricas')}
              disabled={loading}
              className="p-4 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-all disabled:opacity-50"
            >
              📊 Testar Métricas
            </button>

            <button
              onClick={() => executarTeste('todos_dados')}
              disabled={loading}
              className="p-4 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-all disabled:opacity-50"
            >
              🔥 TODOS os Dados
            </button>
            
          </div>
          
          {loading && (
            <div className="mt-4 text-center">
              <div className="inline-flex items-center gap-2 text-purple-400">
                <span className="animate-spin">⏳</span>
                Executando teste...
              </div>
            </div>
          )}
        </div>

        {/* Resultados */}
        {resultados && (
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6">
            <h2 className="text-xl font-semibold mb-4">
              📊 Resultados: {resultados.tipo}
            </h2>
            
            <div className="bg-gray-900 rounded-lg p-4 overflow-auto">
              <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                {JSON.stringify(resultados.dados, null, 2)}
              </pre>
            </div>
            
            {/* Interpretação dos Resultados */}
            <div className="mt-4 p-4 bg-gray-700 rounded-lg">
              <h3 className="font-semibold mb-2">🔍 Interpretação:</h3>
              
              {resultados.tipo === 'Teste de Conexão' && (
                <div>
                  {resultados.dados.sucesso ? (
                    <div className="text-green-400">
                      ✅ Conexão bem-sucedida! Encontrados {resultados.dados.totalRegistros} registros.
                      <br />
                      📋 Nome da tabela: {resultados.dados.nomeTabela}
                    </div>
                  ) : (
                    <div className="text-red-400">
                      ❌ Falha na conexão. Verifique:
                      <ul className="list-disc list-inside mt-2 text-sm">
                        <li>Environment variables no Vercel</li>
                        <li>Nome da tabela (deve ser exato)</li>
                        <li>Permissões RLS no Supabase</li>
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {resultados.tipo === 'Lista de Tabelas' && (
                <div>
                  {resultados.dados.length > 0 ? (
                    <div className="text-green-400">
                      ✅ Tabelas encontradas: {resultados.dados.join(', ')}
                      <br />
                      💡 Use uma dessas no arquivo utils/dashboardAnalytics.ts
                    </div>
                  ) : (
                    <div className="text-red-400">
                      ❌ Nenhuma tabela encontrada. Verifique as permissões.
                    </div>
                  )}
                </div>
              )}

              {resultados.tipo === 'Teste de Permissões' && (
                <div>
                  {resultados.dados.temPermissao ? (
                    <div className="text-green-400">
                      ✅ Permissões OK! Pode acessar os dados.
                    </div>
                  ) : (
                    <div className="text-red-400">
                      ❌ Problemas de permissão. Configure RLS no Supabase.
                    </div>
                  )}
                </div>
              )}
              
              {resultados.tipo === 'Métricas Dashboard' && (
                <div className="text-green-400">
                  ✅ Métricas calculadas com sucesso! O dashboard deve estar funcionando.
                </div>
              )}

              {resultados.tipo === 'Teste TODOS os Dados' && (
                <div>
                  {resultados.dados.totalAtendimentos > 1000 ? (
                    <div className="text-green-400">
                      🎉 EXCELENTE! Limite de 1000 registros foi corrigido!
                      <br />
                      📊 Total encontrado: {resultados.dados.totalAtendimentos} atendimentos
                      <br />
                      💡 O dashboard agora mostra todos os dados reais!
                    </div>
                  ) : (
                    <div className="text-yellow-400">
                      ⚠️ Ainda parece limitado a {resultados.dados.totalAtendimentos} registros
                      <br />
                      💡 Verifique se o código foi atualizado corretamente
                    </div>
                  )}
                </div>
              )}

              {resultados.tipo === 'Erro' && (
                <div className="text-red-400">
                  ❌ Erro durante o teste. Verifique o console do navegador para mais detalhes.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Instruções de Solução */}
        <div className="bg-yellow-900/50 border border-yellow-500 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-yellow-400">💡 Guia de Solução</h2>
          <div className="space-y-4 text-yellow-200">
            
            <div>
              <h3 className="font-semibold">🔗 Se "Conexão Básica" falhar:</h3>
              <ol className="list-decimal list-inside mt-2 text-sm space-y-1">
                <li>Verifique as Environment Variables no Vercel</li>
                <li>Faça um redeploy do projeto</li>
                <li>Teste o "Listar Tabelas" para ver o nome correto</li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold">📋 Se "Listar Tabelas" não encontrar nada:</h3>
              <ol className="list-decimal list-inside mt-2 text-sm space-y-1">
                <li>Acesse o Supabase Dashboard</li>
                <li>Vá em Authentication → Policies</li>
                <li>Crie uma política de SELECT para acesso público</li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold">📊 Nome correto da tabela:</h3>
              <p className="mt-2 text-sm">
                Atualize o nome em <code>utils/dashboardAnalytics.ts</code> e <code>lib/supabase.ts</code>
              </p>
            </div>

          </div>
        </div>

        {/* Link para voltar */}
        <div className="text-center">
          <a 
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-all"
          >
            ← Voltar ao Dashboard
          </a>
        </div>

      </div>
    </div>
  )
}
