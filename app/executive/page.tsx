'use client'

import { useState, useEffect } from 'react'

interface TerapeutaStats {
  terapeuta_id: number
  nome_terapeuta: string
  total_atendimentos: number
  alunos_unicos: number
  nota_media_alunos: number
}

// 📊 DADOS DE FALLBACK (baseados na imagem que você mostrou)
const DADOS_FALLBACK: TerapeutaStats[] = [
  {
    terapeuta_id: 3,
    nome_terapeuta: 'Bia Bezerra',
    total_atendimentos: 69,
    alunos_unicos: 59,
    nota_media_alunos: 9.6
  },
  {
    terapeuta_id: 6,
    nome_terapeuta: 'Carol Gomes',
    total_atendimentos: 32,
    alunos_unicos: 28,
    nota_media_alunos: 7.2
  },
  {
    terapeuta_id: 5,
    nome_terapeuta: 'Davi Belo',
    total_atendimentos: 25,
    alunos_unicos: 21,
    nota_media_alunos: 11.6
  },
  {
    terapeuta_id: 1,
    nome_terapeuta: 'Júlio Lucena',
    total_atendimentos: 23,
    alunos_unicos: 23,
    nota_media_alunos: 6.7
  },
  {
    terapeuta_id: 7,
    nome_terapeuta: 'Dani Matias',
    total_atendimentos: 19,
    alunos_unicos: 15,
    nota_media_alunos: 7.1
  },
  {
    terapeuta_id: 11,
    nome_terapeuta: 'Maria Eduarda Costa',
    total_atendimentos: 15,
    alunos_unicos: 13,
    nota_media_alunos: 2.7
  },
  {
    terapeuta_id: 10,
    nome_terapeuta: 'Olga Gomes',
    total_atendimentos: 12,
    alunos_unicos: 10,
    nota_media_alunos: 4.5
  },
  {
    terapeuta_id: 4,
    nome_terapeuta: 'Bia Londres',
    total_atendimentos: 8,
    alunos_unicos: 7,
    nota_media_alunos: 12.3
  }
]

export default function ExecutivePage() {
  const [terapeutas, setTerapeutas] = useState<TerapeutaStats[]>(DADOS_FALLBACK)
  const [periodo, setPeriodo] = useState('mes_atual')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [usandoFallback, setUsandoFallback] = useState(true)

  // Função para carregar dados reais
  const carregarDadosReais = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🔄 Tentando carregar dados reais para:', periodo)
      const { getTerapeutasStats } = await import('@/utils/dashboardAnalytics')
      const dadosReais = await getTerapeutasStats(periodo)
      
      if (dadosReais && dadosReais.length > 0) {
        console.log('✅ Dados reais carregados:', dadosReais.length, 'terapeutas')
        setTerapeutas(dadosReais)
        setUsandoFallback(false)
      } else {
        console.log('⚠️ Dados reais vazios, usando fallback')
        setTerapeutas(DADOS_FALLBACK)
        setUsandoFallback(true)
      }
      
    } catch (err) {
      console.error('❌ Erro ao carregar dados reais:', err)
      setError('Erro ao conectar com Supabase - usando dados locais')
      setTerapeutas(DADOS_FALLBACK)
      setUsandoFallback(true)
    } finally {
      setLoading(false)
    }
  }

  // Auto-carregar só quando período muda (não no primeiro render)
  useEffect(() => {
    if (periodo !== 'mes_atual') {
      carregarDadosReais()
    }
  }, [periodo])

  const periodos = [
    { valor: 'mes_atual', label: 'Mês Atual' },
    { valor: 'ultimo_mes', label: 'Último Mês' },
    { valor: 'trimestre', label: 'Último Trimestre' },
    { valor: 'semestre', label: 'Último Semestre' }
  ]

  // Funções para interpretar nota dos alunos (0-20, menor é melhor)
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
              <div style={{
                marginTop: '0.5rem',
                padding: '0.75rem',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid #3b82f6',
                borderRadius: '8px',
                fontSize: '0.875rem'
              }}>
                <span style={{ color: '#60a5fa', fontWeight: '500' }}>💡 Escala de Notas:</span>
                <span style={{ color: '#d1d5db', marginLeft: '0.5rem' }}>
                  0-5: Excelente (alunos estáveis) • 6-10: Bom • 11-15: Atenção • 16-20: Crítico
                </span>
              </div>
            </div>
          </div>
          
          {/* Botão Voltar */}
          <a 
            href="/"
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

        {/* Status e Botões */}
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '1rem', 
          marginBottom: '2rem' 
        }}>
          {/* Seletores de Período */}
          {periodos.map((p) => (
            <button
              key={p.valor}
              onClick={() => setPeriodo(p.valor)}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '12px',
                fontWeight: '500',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: periodo === p.valor ? '#7c3aed' : '#374151',
                color: periodo === p.valor ? 'white' : '#d1d5db'
              }}
            >
              {p.label}
            </button>
          ))}
          
          {/* Botão para tentar carregar dados reais */}
          <button
            onClick={carregarDadosReais}
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
            {loading ? 'Carregando...' : 'Conectar Supabase'}
          </button>
        </div>

        {/* Status */}
        {error && (
          <div style={{
            backgroundColor: 'rgba(217, 119, 6, 0.2)',
            border: '1px solid #d97706',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '2rem',
            color: '#fcd34d'
          }}>
            ⚠️ {error}
          </div>
        )}

        {usandoFallback && !loading && (
          <div style={{
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            border: '1px solid #3b82f6',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '2rem',
            color: '#93c5fd'
          }}>
            💡 Mostrando dados de exemplo. Clique em "Conectar Supabase" para dados reais.
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              color: '#c084fc' 
            }}>
              <span style={{ animation: 'spin 1s linear infinite' }}>⏳</span>
              Carregando dados dos terapeutas...
            </div>
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
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
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
                  </div>
                </div>
              ))}
            </div>

            {/* Resumo Estatístico */}
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
                📊 Resumo Estatístico {usandoFallback ? '(Dados de Exemplo)' : ''}
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

            {/* Ranking */}
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
                  .sort((a, b) => a.nota_media_alunos - b.nota_media_alunos) // Ordenar por nota menor (melhor)
                  .map((terapeuta, index) => (
                    <div 
                      key={terapeuta.terapeuta_id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1rem',
                        backgroundColor: 'rgba(55, 65, 81, 0.5)',
                        borderRadius: '8px'
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
                            index === 0 ? '#10b981' :  // Verde para o melhor (nota mais baixa)
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
            {usandoFallback ? 'Dados de exemplo' : 'Dados reais do Supabase'} • {new Date().toLocaleString('pt-BR')}
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
