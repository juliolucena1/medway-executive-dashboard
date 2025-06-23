'use client'

import { useState, useEffect } from 'react'

export default function DebugPage() {
  const [resultados, setResultados] = useState<any>(null)
  const [verificacao, setVerificacao] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testarTodosSistema = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🔄 [Debug] Iniciando teste completo do sistema...')
      
      // Importar as funções de debug
      const { debugFiltros, verificarDadosCompletos } = await import('@/utils/dashboardAnalytics')
      
      // 1. Verificar dados completos primeiro
      console.log('📊 [Debug] Verificando dados completos...')
      const dadosCompletos = await verificarDadosCompletos()
      setVerificacao(dadosCompletos)
      
      // 2. Testar todos os filtros
      console.log('🔍 [Debug] Testando filtros...')
      const testesFiltros = await debugFiltros()
      setResultados(testesFiltros)
      
      console.log('✅ [Debug] Teste completo finalizado')
      
    } catch (err: any) {
      console.error('❌ [Debug] Erro no teste:', err)
      setError(`Erro: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    testarTodosSistema()
  }, [])

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
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            background: 'linear-gradient(to right, #ef4444, #f97316)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            marginBottom: '0.5rem'
          }}>
            🔧 Debug Dashboard Medway
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '1.125rem' }}>
            Diagnóstico completo dos dados e filtros
          </p>
          
          <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <a 
              href="/"
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#374151',
                borderRadius: '8px',
                color: 'white',
                textDecoration: 'none'
              }}
            >
              ← Dashboard Principal
            </a>
            <a 
              href="/executive"
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#7c3aed',
                borderRadius: '8px',
                color: 'white',
                textDecoration: 'none'
              }}
            >
              Executive →
            </a>
            <button
              onClick={testarTodosSistema}
              disabled={loading}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: loading ? '#6b7280' : '#059669',
                borderRadius: '8px',
                color: 'white',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? '🔄 Testando...' : '🔄 Testar Novamente'}
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid #3b82f6',
            borderRadius: '12px',
            padding: '2rem',
            textAlign: 'center',
            marginBottom: '2rem'
          }}>
            <div style={{ 
              fontSize: '1.25rem', 
              color: '#93c5fd',
              marginBottom: '1rem'
            }}>
              <span style={{ animation: 'spin 1s linear infinite' }}>⏳</span>
              Executando diagnóstico completo...
            </div>
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              Isso pode levar alguns segundos para verificar todos os dados
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid #ef4444',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <h3 style={{ color: '#fca5a5', margin: '0 0 0.5rem 0' }}>❌ Erro no Diagnóstico</h3>
            <p style={{ color: '#fecaca', margin: 0, fontSize: '0.875rem' }}>{error}</p>
          </div>
        )}

        {/* Verificação de Dados Completos */}
        {verificacao && (
          <div style={{
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid #10b981',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#34d399',
              marginBottom: '1rem'
            }}>
              📊 Verificação de Dados Completos
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  color: '#10b981'
                }}>
                  {verificacao.totalRegistros?.toLocaleString() || '0'}
                </div>
                <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Total de Registros</div>
                {verificacao.totalRegistros > 1500 && (
                  <div style={{ color: '#10b981', fontSize: '0.75rem' }}>✅ Todos os dados carregados</div>
                )}
                {verificacao.totalRegistros <= 1000 && (
                  <div style={{ color: '#ef4444', fontSize: '0.75rem' }}>⚠️ Dados podem estar limitados</div>
                )}
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  color: '#3b82f6'
                }}>
                  {verificacao.terapeutasUnicos || '0'}
                </div>
                <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Terapeutas Únicos</div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  color: '#8b5cf6'
                }}>
                  {verificacao.alunosUnicos || '0'}
                </div>
                <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Alunos Únicos</div>
              </div>
            </div>

            <div style={{ 
              backgroundColor: 'rgba(55, 65, 81, 0.5)', 
              borderRadius: '8px', 
              padding: '1rem',
              marginTop: '1rem'
            }}>
              <h4 style={{ color: '#d1d5db', margin: '0 0 0.5rem 0' }}>IDs dos Terapeutas Encontrados:</h4>
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '0.5rem',
                fontSize: '0.875rem'
              }}>
                {verificacao.terapeutasIds?.map((id: number) => (
                  <span 
                    key={id}
                    style={{
                      backgroundColor: '#374151',
                      color: '#d1d5db',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px'
                    }}
                  >
                    {id}
                  </span>
                )) || 'Carregando...'}
              </div>
            </div>

            <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#9ca3af' }}>
              <p style={{ margin: '0.25rem 0' }}>
                <strong>Primeiro Registro:</strong> {verificacao.primeiroRegistro || 'N/A'}
              </p>
              <p style={{ margin: '0.25rem 0' }}>
                <strong>Último Registro:</strong> {verificacao.ultimoRegistro || 'N/A'}
              </p>
            </div>
          </div>
        )}

        {/* Teste de Filtros */}
        {resultados && (
          <div style={{
            backgroundColor: 'rgba(124, 58, 237, 0.1)',
            border: '1px solid #7c3aed',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#a78bfa',
              marginBottom: '1rem'
            }}>
              🔍 Teste de Filtros por Período
            </h2>

            {/* Status dos Filtros */}
            <div style={{
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              backgroundColor: resultados.filtrosFuncionando 
                ? 'rgba(16, 185, 129, 0.1)' 
                : 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${resultados.filtrosFuncionando ? '#10b981' : '#ef4444'}`
            }}>
              <div style={{
                fontSize: '1.25rem',
                fontWeight: 'bold',
                color: resultados.filtrosFuncionando ? '#10b981' : '#ef4444',
                marginBottom: '0.5rem'
              }}>
                {resultados.filtrosFuncionando ? '✅ Filtros Funcionando' : '❌ Filtros COM PROBLEMA'}
              </div>
              <p style={{ 
                color: '#9ca3af', 
                margin: 0, 
                fontSize: '0.875rem' 
              }}>
                {resultados.filtrosFuncionando 
                  ? `Encontrados ${resultados.numerosUnicos} valores diferentes nos períodos`
                  : 'Todos os períodos retornam os mesmos números - filtros não estão funcionando'
                }
              </p>
            </div>

            {/* Resultados por Período */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1rem'
            }}>
              {Object.entries(resultados).filter(([key]) => 
                ['mesAtual', 'ultimoMes', 'trimestre', 'semestre'].includes(key)
              ).map(([periodo, dados]: [string, any]) => {
                const labels: Record<string, string> = {
                  mesAtual: 'Mês Atual',
                  ultimoMes: 'Último Mês',
                  trimestre: 'Último Trimestre',
                  semestre: 'Último Semestre'
                }

                return (
                  <div 
                    key={periodo}
                    style={{
                      backgroundColor: 'rgba(55, 65, 81, 0.5)',
                      borderRadius: '8px',
                      padding: '1rem'
                    }}
                  >
                    <h4 style={{
                      color: '#d1d5db',
                      margin: '0 0 0.75rem 0',
                      fontSize: '1rem'
                    }}>
                      {labels[periodo]}
                    </h4>
                    
                    <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                      <div style={{ marginBottom: '0.5rem' }}>
                        <span style={{ color: '#c084fc' }}>Atendimentos:</span>
                        <span style={{ fontWeight: 'bold', marginLeft: '0.5rem', color: '#d1d5db' }}>
                          {dados.totalAtendimentos?.toLocaleString() || '0'}
                        </span>
                      </div>
                      <div style={{ marginBottom: '0.5rem' }}>
                        <span style={{ color: '#10b981' }}>Alunos Únicos:</span>
                        <span style={{ fontWeight: 'bold', marginLeft: '0.5rem', color: '#d1d5db' }}>
                          {dados.alunosUnicos?.toLocaleString() || '0'}
                        </span>
                      </div>
                      <div style={{ marginBottom: '0.5rem' }}>
                        <span style={{ color: '#fbbf24' }}>Nota Média:</span>
                        <span style={{ fontWeight: 'bold', marginLeft: '0.5rem', color: '#d1d5db' }}>
                          {dados.notaMediaAlunos || '0'}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: '#60a5fa' }}>Terapeutas:</span>
                        <span style={{ fontWeight: 'bold', marginLeft: '0.5rem', color: '#d1d5db' }}>
                          {dados.terapeutasAtivos || '0'}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Números Únicos Encontrados */}
            <div style={{
              marginTop: '1.5rem',
              padding: '1rem',
              backgroundColor: 'rgba(55, 65, 81, 0.5)',
              borderRadius: '8px'
            }}>
              <h4 style={{ color: '#d1d5db', margin: '0 0 0.5rem 0' }}>
                Números Únicos de Atendimentos por Período:
              </h4>
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '0.5rem',
                fontSize: '0.875rem'
              }}>
                {resultados.numerosDetalhados?.map((num: number, index: number) => (
                  <span 
                    key={index}
                    style={{
                      backgroundColor: '#7c3aed',
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '999px',
                      fontWeight: 'bold'
                    }}
                  >
                    {num.toLocaleString()}
                  </span>
                )) || 'Carregando...'}
              </div>
              <p style={{ 
                color: '#9ca3af', 
                fontSize: '0.75rem', 
                margin: '0.5rem 0 0 0' 
              }}>
                {resultados.numerosUnicos === 1 
                  ? '⚠️ Apenas 1 valor único - filtros não estão funcionando'
                  : `✅ ${resultados.numerosUnicos} valores diferentes - filtros funcionando`
                }
              </p>
            </div>
          </div>
        )}

        {/* Instruções */}
        <div style={{
          backgroundColor: 'rgba(55, 65, 81, 0.5)',
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: 'bold',
            color: '#d1d5db',
            marginBottom: '1rem'
          }}>
            📋 Como Interpretar os Resultados
          </h3>
          
          <div style={{ fontSize: '0.875rem', color: '#9ca3af', lineHeight: 1.6 }}>
            <p style={{ marginBottom: '0.75rem' }}>
              <strong style={{ color: '#10b981' }}>✅ Tudo OK se:</strong>
            </p>
            <ul style={{ marginLeft: '1rem', marginBottom: '1rem' }}>
              <li>Total de registros &gt; 1500 (todos os dados carregados)</li>
              <li>Filtros funcionando = true (números diferentes por período)</li>
              <li>IDs de terapeutas mostram valores reais (não só 3, 6, etc.)</li>
            </ul>
            
            <p style={{ marginBottom: '0.75rem' }}>
              <strong style={{ color: '#ef4444' }}>❌ Problema se:</strong>
            </p>
            <ul style={{ marginLeft: '1rem' }}>
              <li>Total de registros ≤ 1000 (dados limitados)</li>
              <li>Filtros funcionando = false (mesmos números)</li>
              <li>Poucos terapeutas únicos encontrados</li>
            </ul>
          </div>
        </div>

        {/* CSS */}
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>

      </div>
    </div>
  )
}
