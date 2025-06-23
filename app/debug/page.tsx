'use client'

import { useState } from 'react'

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
          const { testarConexao } = await import('@/lib/supabase')
          const resultadoConexao = await testarConexao()
          setResultados({ tipo: 'Teste de Conexão', dados: resultadoConexao })
          break
          
        case 'tabelas':
          console.log('🧪 Listando tabelas disponíveis...')
          const { listarTabelas } = await import('@/lib/supabase')
          const tabelas = await listarTabelas()
          setResultados({ tipo: 'Lista de Tabelas', dados: tabelas })
          break

        case 'permissoes':
          console.log('🧪 Testando permissões RLS...')
          const { testarPermissoes } = await import('@/lib/supabase')
          const permissoes = await testarPermissoes()
          setResultados({ tipo: 'Teste de Permissões', dados: permissoes })
          break
          
        case 'metricas':
          console.log('🧪 Testando cálculo de métricas...')
          const { getDashboardMetrics } = await import('@/utils/dashboardAnalytics')
          const metricas = await getDashboardMetrics('mes_atual') // Usar mês atual como teste
          setResultados({ tipo: 'Métricas Dashboard', dados: metricas })
          break

        case 'todos_dados':
          console.log('🧪 Testando TODOS os dados (sem limite)...')
          const { getDashboardMetrics: getAllMetrics } = await import('@/utils/dashboardAnalytics')
          const todosDados = await getAllMetrics() // Sem período = todos os dados
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
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#111827',
      color: 'white',
      padding: '2rem',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#c084fc',
            marginBottom: '0.5rem'
          }}>
            🔧 Debug - Conexão Supabase
          </h1>
          <p style={{
            color: '#9ca3af',
            margin: 0
          }}>
            Use esta página para testar e debugar a conexão com o Supabase
          </p>
        </div>

        {/* Environment Variables Check */}
        <div style={{
          background: 'linear-gradient(135deg, #1f2937, #111827)',
          borderRadius: '12px',
          padding: '1.5rem',
          border: '1px solid #374151',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            marginBottom: '1rem',
            color: 'white'
          }}>
            📋 Environment Variables
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                backgroundColor: process.env.NEXT_PUBLIC_SUPABASE_URL ? '#10b981' : '#ef4444'
              }}></span>
              <span style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                NEXT_PUBLIC_SUPABASE_URL:
              </span>
              <span style={{ color: '#d1d5db' }}>
                {process.env.NEXT_PUBLIC_SUPABASE_URL || '❌ Não definida'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                backgroundColor: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '#10b981' : '#ef4444'
              }}></span>
              <span style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                NEXT_PUBLIC_SUPABASE_ANON_KEY:
              </span>
              <span style={{ color: '#d1d5db' }}>
                {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY 
                  ? `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20)}...` 
                  : '❌ Não definida'
                }
              </span>
            </div>
          </div>
          
          {(!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) && (
            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              backgroundColor: 'rgba(127, 29, 29, 0.5)',
              border: '1px solid #dc2626',
              borderRadius: '8px'
            }}>
              <p style={{ color: '#fecaca', fontWeight: '600', margin: '0 0 0.5rem 0' }}>
                ⚠️ Environment Variables não configuradas!
              </p>
              <p style={{ color: '#fca5a5', fontSize: '0.875rem', margin: 0 }}>
                Configure as variáveis no Vercel: Settings → Environment Variables
              </p>
            </div>
          )}
        </div>

        {/* Botões de Teste */}
        <div style={{
          background: 'linear-gradient(135deg, #1f2937, #111827)',
          borderRadius: '12px',
          padding: '1.5rem',
          border: '1px solid #374151',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            marginBottom: '1rem',
            color: 'white'
          }}>
            🧪 Testes Disponíveis
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem'
          }}>
            
            <button
              onClick={() => executarTeste('conexao')}
              disabled={loading}
              style={{
                padding: '1rem',
                backgroundColor: '#3b82f6',
                borderRadius: '8px',
                fontWeight: '500',
                border: 'none',
                color: 'white',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
                fontSize: '0.875rem'
              }}
            >
              🔗 Conexão Básica
            </button>
            
            <button
              onClick={() => executarTeste('tabelas')}
              disabled={loading}
              style={{
                padding: '1rem',
                backgroundColor: '#10b981',
                borderRadius: '8px',
                fontWeight: '500',
                border: 'none',
                color: 'white',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
                fontSize: '0.875rem'
              }}
            >
              📋 Listar Tabelas
            </button>

            <button
              onClick={() => executarTeste('permissoes')}
              disabled={loading}
              style={{
                padding: '1rem',
                backgroundColor: '#ea580c',
                borderRadius: '8px',
                fontWeight: '500',
                border: 'none',
                color: 'white',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
                fontSize: '0.875rem'
              }}
            >
              🔒 Permissões RLS
            </button>
            
            <button
              onClick={() => executarTeste('metricas')}
              disabled={loading}
              style={{
                padding: '1rem',
                backgroundColor: '#7c3aed',
                borderRadius: '8px',
                fontWeight: '500',
                border: 'none',
                color: 'white',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
                fontSize: '0.875rem'
              }}
            >
              📊 Testar Métricas
            </button>

            <button
              onClick={() => executarTeste('todos_dados')}
              disabled={loading}
              style={{
                padding: '1rem',
                backgroundColor: '#dc2626',
                borderRadius: '8px',
                fontWeight: '500',
                border: 'none',
                color: 'white',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
                fontSize: '0.875rem'
              }}
            >
              🔥 TODOS os Dados
            </button>
            
          </div>
          
          {loading && (
            <div style={{
              marginTop: '1rem',
              textAlign: 'center'
            }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#c084fc'
              }}>
                <span style={{ animation: 'spin 1s linear infinite' }}>⏳</span>
                Executando teste...
              </div>
            </div>
          )}
        </div>

        {/* Resultados */}
        {resultados && (
          <div style={{
            background: 'linear-gradient(135deg, #1f2937, #111827)',
            borderRadius: '12px',
            padding: '1.5rem',
            border: '1px solid #374151',
            marginBottom: '1.5rem'
          }}>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              marginBottom: '1rem',
              color: 'white'
            }}>
              📊 Resultados: {resultados.tipo}
            </h2>
            
            <div style={{
              backgroundColor: '#111827',
              borderRadius: '8px',
              padding: '1rem',
              overflow: 'auto',
              marginBottom: '1rem'
            }}>
              <pre style={{
                fontSize: '0.875rem',
                color: '#d1d5db',
                whiteSpace: 'pre-wrap',
                margin: 0,
                fontFamily: 'monospace'
              }}>
                {JSON.stringify(resultados.dados, null, 2)}
              </pre>
            </div>
            
            {/* Interpretação dos Resultados */}
            <div style={{
              padding: '1rem',
              backgroundColor: '#374151',
              borderRadius: '8px'
            }}>
              <h3 style={{
                fontWeight: '600',
                marginBottom: '0.5rem',
                color: 'white'
              }}>
                🔍 Interpretação:
              </h3>
              
              {resultados.tipo === 'Teste de Conexão' && (
                <div>
                  {resultados.dados.sucesso ? (
                    <div style={{ color: '#10b981' }}>
                      ✅ Conexão bem-sucedida! Encontrados {resultados.dados.totalRegistros} registros.
                      <br />
                      📋 Nome da tabela: {resultados.dados.nomeTabela}
                    </div>
                  ) : (
                    <div style={{ color: '#ef4444' }}>
                      ❌ Falha na conexão. Verifique:
                      <ul style={{ listStyle: 'disc', listStylePosition: 'inside', marginTop: '0.5rem', fontSize: '0.875rem' }}>
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
                    <div style={{ color: '#10b981' }}>
                      ✅ Tabelas encontradas: {resultados.dados.join(', ')}
                      <br />
                      💡 Use uma dessas no arquivo utils/dashboardAnalytics.ts
                    </div>
                  ) : (
                    <div style={{ color: '#ef4444' }}>
                      ❌ Nenhuma tabela encontrada. Verifique as permissões.
                    </div>
                  )}
                </div>
              )}

              {resultados.tipo === 'Teste de Permissões' && (
                <div>
                  {resultados.dados.temPermissao ? (
                    <div style={{ color: '#10b981' }}>
                      ✅ Permissões OK! Pode acessar os dados.
                    </div>
                  ) : (
                    <div style={{ color: '#ef4444' }}>
                      ❌ Problemas de permissão. Configure RLS no Supabase.
                    </div>
                  )}
                </div>
              )}
              
              {resultados.tipo === 'Métricas Dashboard' && (
                <div style={{ color: '#10b981' }}>
                  ✅ Métricas calculadas com sucesso! O dashboard deve estar funcionando.
                </div>
              )}

              {resultados.tipo === 'Teste TODOS os Dados' && (
                <div>
                  {resultados.dados.totalAtendimentos > 1000 ? (
                    <div style={{ color: '#10b981' }}>
                      🎉 EXCELENTE! Limite de 1000 registros foi corrigido!
                      <br />
                      📊 Total encontrado: {resultados.dados.totalAtendimentos} atendimentos
                      <br />
                      💡 O dashboard agora mostra todos os dados reais!
                    </div>
                  ) : (
                    <div style={{ color: '#fbbf24' }}>
                      ⚠️ Ainda parece limitado a {resultados.dados.totalAtendimentos} registros
                      <br />
                      💡 Verifique se o código foi atualizado corretamente
                    </div>
                  )}
                </div>
              )}

              {resultados.tipo === 'Erro' && (
                <div style={{ color: '#ef4444' }}>
                  ❌ Erro durante o teste. Verifique o console do navegador para mais detalhes.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Instruções de Solução */}
        <div style={{
          backgroundColor: 'rgba(217, 119, 6, 0.2)',
          border: '1px solid #d97706',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            marginBottom: '1rem',
            color: '#fbbf24'
          }}>
            💡 Guia de Solução
          </h2>
          <div style={{ 
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            color: '#fcd34d'
          }}>
            
            <div>
              <h3 style={{ fontWeight: '600' }}>🔗 Se "Conexão Básica" falhar:</h3>
              <ol style={{ listStyle: 'decimal', listStylePosition: 'inside', marginTop: '0.5rem', fontSize: '0.875rem' }}>
                <li>Verifique as Environment Variables no Vercel</li>
                <li>Faça um redeploy do projeto</li>
                <li>Teste o "Listar Tabelas" para ver o nome correto</li>
              </ol>
            </div>

            <div>
              <h3 style={{ fontWeight: '600' }}>📋 Se "Listar Tabelas" não encontrar nada:</h3>
              <ol style={{ listStyle: 'decimal', listStylePosition: 'inside', marginTop: '0.5rem', fontSize: '0.875rem' }}>
                <li>Acesse o Supabase Dashboard</li>
                <li>Vá em Authentication → Policies</li>
                <li>Crie uma política de SELECT para acesso público</li>
              </ol>
            </div>

            <div>
              <h3 style={{ fontWeight: '600' }}>📊 Nome correto da tabela:</h3>
              <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
                Atualize o nome em <code style={{ backgroundColor: '#374151', padding: '0.25rem', borderRadius: '4px' }}>utils/dashboardAnalytics.ts</code> e <code style={{ backgroundColor: '#374151', padding: '0.25rem', borderRadius: '4px' }}>lib/supabase.ts</code>
              </p>
            </div>

          </div>
        </div>

        {/* Link para voltar */}
        <div style={{ textAlign: 'center' }}>
          <a 
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#7c3aed',
              borderRadius: '8px',
              fontWeight: '500',
              color: 'white',
              textDecoration: 'none'
            }}
          >
            ← Voltar ao Dashboard
          </a>
        </div>

        {/* CSS para animação */}
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          @media (max-width: 768px) {
            div[style*="padding: '2rem'"] {
              padding: 1rem !important;
            }
            div[style*="gridTemplateColumns"] {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>

      </div>
    </div>
  )
}
