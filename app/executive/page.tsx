'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

interface TerapeutaStats {
  terapeuta_id: number
  nome_terapeuta: string
  total_atendimentos: number
  alunos_unicos: number
  nota_media_alunos: number
}

export default function ExecutivePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // 🔧 CORREÇÃO 1: Estado sincronizado com URL e Dashboard principal
  const [periodo, setPeriodo] = useState(() => {
    return searchParams.get('periodo') || 'mes_atual'
  })
  
  const [terapeutas, setTerapeutas] = useState<TerapeutaStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dataUltimaAtualizacao, setDataUltimaAtualizacao] = useState<Date>(new Date())

  // 🔧 CORREÇÃO 2: Função que carrega dados REAIS do Supabase
  const carregarDados = async (novoPeriodo?: string) => {
    const periodoParaUsar = novoPeriodo || periodo
    
    try {
      setLoading(true)
      setError(null)
      
      console.log('🔄 [Executive] Carregando dados dos terapeutas para período:', periodoParaUsar)
      
      const { getTerapeutasStats } = await import('@/utils/dashboardAnalytics')
      const dadosTerapeutas = await getTerapeutasStats(periodoParaUsar)
      
      console.log('✅ [Executive] Dados dos terapeutas carregados:', dadosTerapeutas)
      
      if (dadosTerapeutas && dadosTerapeutas.length > 0) {
        setTerapeutas(dadosTerapeutas)
        setDataUltimaAtualizacao(new Date())
        setError(null)
      } else {
        console.log('⚠️ [Executive] Nenhum dado encontrado, usando fallback')
        setError('Nenhum dado encontrado para este período')
        // 🔧 CORREÇÃO 3: Fallback apenas se não houver dados reais
        setTerapeutas([
          {
            terapeuta_id: 1,
            nome_terapeuta: 'Dados não encontrados',
            total_atendimentos: 0,
            alunos_unicos: 0,
            nota_media_alunos: 0
          }
        ])
      }
      
    } catch (err: any) {
      console.error('❌ [Executive] Erro ao carregar dados:', err)
      setError(`Erro: ${err.message || 'Falha na conexão'}`)
      
      // 🔧 CORREÇÃO 4: Fallback realista com aviso claro
      setTerapeutas([
        {
          terapeuta_id: 999,
          nome_terapeuta: '⚠️ Erro de Conexão',
          total_atendimentos: 0,
          alunos_unicos: 0,
          nota_media_alunos: 0
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  // 🔧 CORREÇÃO 5: Função que muda período E atualiza URL
  const mudarPeriodo = async (novoPeriodo: string) => {
    setPeriodo(novoPeriodo)
    
    // Atualizar URL para manter sincronização
    const newSearchParams = new URLSearchParams(searchParams.toString())
    newSearchParams.set('periodo', novoPeriodo)
    router.push(`/executive?${newSearchParams.toString()}`)
    
    // Carregar dados para o novo período
    await carregarDados(novoPeriodo)
  }

  // 🔧 CORREÇÃO 6: useEffect que reage a mudanças na URL
  useEffect(() => {
    const periodoURL = searchParams.get('periodo')
    if (periodoURL && periodoURL !== periodo) {
      setPeriodo(periodoURL)
      carregarDados(periodoURL)
    }
  }, [searchParams])

  // 🔧 CORREÇÃO 7: Carregar dados iniciais
  useEffect(() => {
    carregarDados()
  }, []) // Só roda uma vez

  const periodos = [
    { valor: 'mes_atual', label: 'Mês Atual' },
    { valor: 'ultimo_mes', label: 'Último Mês' },
    { valor: 'trimestre', label: 'Último Trimestre' },
    { valor: 'semestre', label: 'Último Semestre' }
  ]

  // 🔧 CORREÇÃO 8: Funções de interpretação das notas corrigidas
  const getStatusColor = (notaAlunos: number) => {
    if (notaAlunos <= 5) return '#10b981'   // Verde - alunos estáveis
    if (notaAlunos <= 10) return '#fbbf24'  // Amarelo - situação média
    if (notaAlunos <= 15) return '#ea580c'  // Laranja - precisa atenção
    return '#ef4444'                        // Vermelho - situação crítica
  }

  const getStatusText = (notaAlunos: number) => {
    if (notaAlunos <= 5) return 'Excelente'      // Alunos muito estáveis
    if (notaAlunos <= 10) return 'Bom'           // Alunos estáveis
    if (notaAlunos <= 15) return 'Atenção'       // Alunos precisam atenção
    return 'Crítico'                             // Alunos em situação crítica
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
        
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              width: '64px',
              height: '64px',
              background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '1rem',
              fontSize: '1.5rem'
            }}>
              👥
            </div>
            <div>
              <h1 style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                background: 'linear-gradient(to right, #c084fc, #60a5fa)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                margin: 0
              }}>
                Análise Individual dos Terapeutas
              </h1>
              <p style={{
                color: '#9ca3af',
                fontSize: '1.125rem',
                margin: '0.5rem 0 0 0'
              }}>
                Performance e produtividade detalhada por terapeuta
              </p>
            </div>
          </div>
          
          {/* 🔧 CORREÇÃO 9: Botão Voltar mantém período */}
          <a 
            href={`/?periodo=${periodo}`}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#374151',
              borderRadius: '8px',
              fontWeight: '500',
              color: 'white',
              textDecoration: 'none'
            }}
          >
            ← Voltar ao Dashboard
          </a>
        </div>

        {/* 🔧 CORREÇÃO 10: Informações de Escala sempre visíveis */}
        <div style={{
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid #3b82f6',
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '2rem',
          color: '#93c5fd'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#60a5fa' }}>
            📊 Como interpretar as notas dos alunos:
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.875rem' }}>
            <span><span style={{color: '#10b981'}}>●</span> 0-5: Excelente (alunos muito estáveis)</span>
            <span><span style={{color: '#fbbf24'}}>●</span> 6-10: Bom (alunos estáveis)</span>
            <span><span style={{color: '#ea580c'}}>●</span> 11-15: Atenção (precisam acompanhamento)</span>
            <span><span style={{color: '#ef4444'}}>●</span> 16-20: Crítico (situação preocupante)</span>
          </div>
        </div>

        {/* Seletores de Período */}
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '1rem', 
          marginBottom: '2rem' 
        }}>
          {periodos.map((p) => (
            <button
              key={p.valor}
              onClick={() => mudarPeriodo(p.valor)}
              disabled={loading}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '12px',
                fontWeight: '500',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                backgroundColor: periodo === p.valor ? '#7c3aed' : '#374151',
                color: periodo === p.valor ? 'white' : '#d1d5db',
                opacity: loading ? 0.6 : 1,
                position: 'relative'
              }}
            >
              {loading && periodo === p.valor && (
                <span style={{ 
                  marginRight: '0.5rem',
                  animation: 'spin 1s linear infinite' 
                }}>⏳</span>
              )}
              {p.label}
            </button>
          ))}
          
          <button
            onClick={() => carregarDados()}
            disabled={loading}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: loading ? '#6b7280' : '#059669',
              borderRadius: '12px',
              fontWeight: '500',
              border: 'none',
              color: 'white',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <span style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }}>
              {loading ? '⏳' : '🔄'}
            </span>
            Atualizar Dados
          </button>
        </div>

        {/* 🔧 CORREÇÃO 11: Loading/Error states melhorados */}
        {loading && (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem',
            backgroundColor: 'rgba(31, 41, 55, 0.5)',
            borderRadius: '12px',
            marginBottom: '2rem'
          }}>
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              color: '#c084fc',
              fontSize: '1.125rem'
            }}>
              <span style={{ animation: 'spin 1s linear infinite' }}>⏳</span>
              Carregando dados dos terapeutas do Supabase...
            </div>
            <p style={{ color: '#9ca3af', margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>
              Período: {periodos.find(p => p.valor === periodo)?.label}
            </p>
          </div>
        )}

        {error && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid #ef4444',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '2rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span>⚠️</span>
              <strong style={{ color: '#fca5a5' }}>Problema de Conexão</strong>
            </div>
            <p style={{ color: '#fecaca', margin: '0 0 0.5rem 0', fontSize: '0.875rem' }}>
              {error}
            </p>
            <button 
              onClick={() => carregarDados()}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#ef4444',
                border: 'none',
                borderRadius: '6px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              🔄 Tentar Conectar Novamente
            </button>
          </div>
        )}

        {/* Cards dos Terapeutas */}
        {!loading && (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
              {terapeutas.map((terapeuta) => (
                <div
                  key={terapeuta.terapeuta_id}
                  style={{
                    background: 'linear-gradient(135deg, #1f2937, #111827)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    border: '1px solid #374151',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    // 🔧 CORREÇÃO 12: Destaque visual para dados problemáticos
                    ...(terapeuta.nome_terapeuta.includes('Erro') || terapeuta.nome_terapeuta.includes('não encontrados') 
                        ? { border: '2px solid #ef4444', backgroundColor: 'rgba(239, 68, 68, 0.05)' }
                        : {})
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1rem'
                  }}>
                    <h3 style={{
                      fontSize: '1.25rem',
                      fontWeight: 'bold',
                      color: 'white',
                      margin: 0
                    }}>
                      {terapeuta.nome_terapeuta}
                    </h3>
                    {terapeuta.total_atendimentos > 0 && (
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        color: 'white',
                        backgroundColor: getStatusColor(terapeuta.nota_media_alunos)
                      }}>
                        {getStatusText(terapeuta.nota_media_alunos)}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {/* Total de Atendimentos */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#9ca3af' }}>Atendimentos:</span>
                      <span style={{ 
                        color: '#c084fc', 
                        fontWeight: 'bold', 
                        fontSize: '1.125rem' 
                      }}>
                        {terapeuta.total_atendimentos}
                      </span>
                    </div>

                    {/* Alunos Únicos */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#9ca3af' }}>Alunos Únicos:</span>
                      <span style={{ 
                        color: '#10b981', 
                        fontWeight: 'bold', 
                        fontSize: '1.125rem' 
                      }}>
                        {terapeuta.alunos_unicos}
                      </span>
                    </div>

                    {/* Nota Média dos Alunos */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#9ca3af' }}>Nota Média dos Alunos:</span>
                      <span style={{ 
                        color: getStatusColor(terapeuta.nota_media_alunos),
                        fontWeight: 'bold', 
                        fontSize: '1.125rem' 
                      }}>
                        {terapeuta.nota_media_alunos}
                      </span>
                    </div>

                    {/* Atendimentos por Aluno */}
                    {terapeuta.alunos_unicos > 0 && (
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        paddingTop: '0.5rem',
                        borderTop: '1px solid #374151'
                      }}>
                        <span style={{ color: '#9ca3af' }}>Atend./Aluno:</span>
                        <span style={{ 
                          color: '#60a5fa', 
                          fontWeight: 'bold' 
                        }}>
                          {(terapeuta.total_atendimentos / terapeuta.alunos_unicos).toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Resumo Estatístico */}
            {terapeutas.length > 0 && terapeutas[0].total_atendimentos > 0 && (
              <div style={{
                background: 'linear-gradient(135deg, #1f2937, #111827)',
                borderRadius: '16px',
                padding: '2rem',
                border: '1px solid #374151',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                marginBottom: '2rem'
              }}>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: 'white',
                  marginBottom: '1.5rem'
                }}>
                  📊 Resumo Estatístico - {periodos.find(p => p.valor === periodo)?.label}
                </h2>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1.5rem'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: '2rem',
                      fontWeight: 'bold',
                      color: '#c084fc',
                      marginBottom: '0.5rem'
                    }}>
                      {terapeutas.reduce((sum, t) => sum + t.total_atendimentos, 0).toLocaleString()}
                    </div>
                    <div style={{ color: '#9ca3af' }}>Total de Atendimentos</div>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: '2rem',
                      fontWeight: 'bold',
                      color: '#10b981',
                      marginBottom: '0.5rem'
                    }}>
                      {terapeutas.reduce((sum, t) => sum + t.alunos_unicos, 0).toLocaleString()}
                    </div>
                    <div style={{ color: '#9ca3af' }}>Total de Alunos Únicos</div>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: '2rem',
                      fontWeight: 'bold',
                      color: '#fbbf24',
                      marginBottom: '0.5rem'
                    }}>
                      {terapeutas.length > 0 
                        ? (terapeutas.reduce((sum, t) => sum + t.nota_media_alunos, 0) / terapeutas.length).toFixed(1)
                        : '0'
                      }
                    </div>
                    <div style={{ color: '#9ca3af' }}>Nota Média Geral dos Alunos</div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                      (0=estável, 20=crítico)
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 🔧 CORREÇÃO 13: Ranking corrigido - melhor terapeuta = menor nota */}
            {terapeutas.length > 0 && terapeutas[0].total_atendimentos > 0 && (
              <div style={{
                background: 'linear-gradient(135deg, #1f2937, #111827)',
                borderRadius: '16px',
                padding: '2rem',
                border: '1px solid #374151',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: 'white',
                  marginBottom: '1.5rem'
                }}>
                  🏆 Ranking - Alunos Mais Estáveis
                </h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {terapeutas
                    .filter(t => t.total_atendimentos > 0)
                    .sort((a, b) => a.nota_media_alunos - b.nota_media_alunos) // 🔧 Menor nota = melhor
                    .map((terapeuta, index) => (
                      <div 
                        key={terapeuta.terapeuta_id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '1rem',
                          backgroundColor: 'rgba(55, 65, 81, 0.5)',
                          borderRadius: '8px',
                          border: index === 0 ? '2px solid #10b981' : '1px solid #374151'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            backgroundColor: 
                              index === 0 ? '#10b981' :  // Verde para o melhor
                              index === 1 ? '#fbbf24' :  // Amarelo para segundo
                              index === 2 ? '#ea580c' : '#6b7280', // Laranja para terceiro
                            color: 'white'
                          }}>
                            {index + 1}
                          </div>
                          <span style={{ fontWeight: '500' }}>
                            {terapeuta.nome_terapeuta}
                          </span>
                        </div>
                        
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '1.5rem', 
                          fontSize: '0.875rem' 
                        }}>
                          <span style={{ color: '#9ca3af' }}>
                            {terapeuta.total_atendimentos} atendimentos
                          </span>
                          <span style={{ 
                            fontWeight: 'bold',
                            color: getStatusColor(terapeuta.nota_media_alunos)
                          }}>
                            Nota: {terapeuta.nota_media_alunos} ({getStatusText(terapeuta.nota_media_alunos)})
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Footer */}
        <div style={{
          marginTop: '2rem',
          textAlign: 'center',
          fontSize: '0.875rem',
          color: '#6b7280'
        }}>
          <p style={{ margin: 0 }}>
            Período selecionado: <span style={{ color: '#c084fc', fontWeight: '500' }}>
              {periodos.find(p => p.valor === periodo)?.label}
            </span>
          </p>
          <p style={{ margin: '0.25rem 0' }}>
            Dados atualizados em: {dataUltimaAtualizacao.toLocaleString('pt-BR')}
          </p>
          <p style={{ margin: '0.25rem 0', fontSize: '0.75rem' }}>
            {error ? '⚠️ Usando dados de fallback - verificar conexão Supabase' : 
             '✅ Conectado ao Supabase - dados em tempo real'}
          </p>
        </div>

        {/* CSS para animação */}
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          @media (max-width: 768px) {
            div[style*="fontSize: '2.5rem'"] {
              font-size: 1.8rem !important;
            }
            div[style*="padding: '2rem'"] {
              padding: 1rem !important;
            }
          }
        `}</style>

      </div>
    </div>
  )
}
