'use client'

import { useState, useEffect } from 'react'

interface TerapeutaStats {
  terapeuta_id: number
  total_atendimentos: number
  alunos_unicos: number
  nota_media: number
}

export default function ExecutivePage() {
  const [terapeutas, setTerapeutas] = useState<TerapeutaStats[]>([])
  const [periodo, setPeriodo] = useState('trimestre')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Função para carregar os dados dos terapeutas
  const carregarDados = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🔄 Carregando dados dos terapeutas para o período:', periodo)
      const { getTerapeutasStats } = await import('@/utils/dashboardAnalytics')
      const dadosTerapeutas = await getTerapeutasStats(periodo)
      
      console.log('✅ Dados dos terapeutas carregados:', dadosTerapeutas)
      setTerapeutas(dadosTerapeutas)
      
    } catch (err) {
      console.error('❌ Erro ao carregar dados dos terapeutas:', err)
      setError('Erro ao carregar dados dos terapeutas.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarDados()
  }, [periodo])

  const periodos = [
    { valor: 'semana', label: 'Última Semana' },
    { valor: 'mes', label: 'Último Mês' },
    { valor: 'trimestre', label: 'Último Trimestre' },
    { valor: 'semestre', label: 'Último Semestre' },
    { valor: 'ano', label: 'Último Ano' }
  ]

  const getStatusColor = (nota: number) => {
    if (nota >= 8) return '#10b981'
    if (nota >= 6) return '#fbbf24'
    return '#ef4444'
  }

  const getStatusText = (nota: number) => {
    if (nota >= 8) return 'Excelente'
    if (nota >= 6) return 'Bom'
    return 'Precisa Melhorar'
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
          
          <button
            onClick={carregarDados}
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
            Atualizar
          </button>
        </div>

        {/* Loading/Error */}
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

        {error && (
          <div style={{
            backgroundColor: 'rgba(127, 29, 29, 0.5)',
            border: '1px solid #dc2626',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '2rem'
          }}>
            <p style={{ color: '#fecaca', margin: 0 }}>⚠️ {error}</p>
            <button 
              onClick={carregarDados}
              style={{
                marginTop: '0.5rem',
                color: '#f87171',
                background: 'none',
                border: 'none',
                textDecoration: 'underline',
                cursor: 'pointer'
              }}
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* Cards dos Terapeutas */}
        {!loading && !error && (
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
                      Terapeuta {terapeuta.terapeuta_id}
                    </h3>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '999px',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      color: 'white',
                      backgroundColor: getStatusColor(terapeuta.nota_media)
                    }}>
                      {getStatusText(terapeuta.nota_media)}
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

                    {/* Nota Média */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#9ca3af' }}>Nota Média:</span>
                      <span style={{ 
                        color: getStatusColor(terapeuta.nota_media),
                        fontWeight: 'bold', 
                        fontSize: '1.125rem' 
                      }}>
                        {terapeuta.nota_media}
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
                📊 Resumo Estatístico
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
                      ? (terapeutas.reduce((sum, t) => sum + t.nota_media, 0) / terapeutas.length).toFixed(1)
                      : '0'
                    }
                  </div>
                  <div style={{ color: '#9ca3af' }}>Nota Média Geral</div>
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
                🏆 Ranking de Performance
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {terapeutas
                  .sort((a, b) => b.nota_media - a.nota_media)
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
                            index === 0 ? '#fbbf24' :
                            index === 1 ? '#9ca3af' :
                            index === 2 ? '#ea580c' : '#6b7280',
                          color: index < 3 ? 'black' : 'white'
                        }}>
                          {index + 1}
                        </div>
                        <span style={{ fontWeight: '500' }}>
                          Terapeuta {terapeuta.terapeuta_id}
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
                          color: getStatusColor(terapeuta.nota_media)
                        }}>
                          Nota: {terapeuta.nota_media}
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
            Dados atualizados em: {new Date().toLocaleString('pt-BR')}
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
