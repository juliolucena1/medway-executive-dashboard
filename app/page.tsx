'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

// Dados que sabemos que existem (valores corrigidos)
const DADOS_REAIS = {
  totalAtendimentos: 1714,
  alunosUnicos: 625,
  notaMediaAlunos: 8.4,
  terapeutasAtivos: 8
}

export default function Dashboard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // 🔧 CORREÇÃO 1: Estado sincronizado com URL
  const [periodo, setPeriodo] = useState(() => {
    return searchParams.get('periodo') || 'mes_atual'
  })
  
  const [metrics, setMetrics] = useState({
    totalAtendimentos: DADOS_REAIS.totalAtendimentos,
    alunosUnicos: DADOS_REAIS.alunosUnicos,
    notaMediaAlunos: DADOS_REAIS.notaMediaAlunos,
    terapeutasAtivos: DADOS_REAIS.terapeutasAtivos
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tentandoConectar, setTentandoConectar] = useState(false)
  const [dataUltimaAtualizacao, setDataUltimaAtualizacao] = useState<Date>(new Date())

  // 🔧 CORREÇÃO 2: Função que realmente recarrega dados conforme período
  const carregarDadosReais = async (novoPeriodo?: string) => {
    const periodoParaUsar = novoPeriodo || periodo
    
    try {
      setTentandoConectar(true)
      setLoading(true)
      setError(null)
      
      console.log('🔄 Carregando dados para período:', periodoParaUsar)
      
      const { getDashboardMetrics } = await import('@/utils/dashboardAnalytics')
      const dadosSupabase = await getDashboardMetrics(periodoParaUsar)
      
      console.log('✅ Dados carregados:', dadosSupabase)
      setMetrics(dadosSupabase)
      setDataUltimaAtualizacao(new Date())
      setError(null)
      
    } catch (err: any) {
      console.error('❌ Erro ao carregar do Supabase:', err)
      setError(`Erro: ${err.message || 'Conexão falhou'} - Usando dados locais`)
      // Manter os dados reais como fallback
    } finally {
      setLoading(false)
      setTentandoConectar(false)
    }
  }

  // 🔧 CORREÇÃO 3: Função que muda período E atualiza URL
  const mudarPeriodo = async (novoPeriodo: string) => {
    setPeriodo(novoPeriodo)
    
    // Atualizar URL para manter estado
    const newSearchParams = new URLSearchParams(searchParams.toString())
    newSearchParams.set('periodo', novoPeriodo)
    router.push(`?${newSearchParams.toString()}`)
    
    // Tentar carregar dados reais para o novo período
    await carregarDadosReais(novoPeriodo)
  }

  // 🔧 CORREÇÃO 4: useEffect que reage a mudanças de período na URL
  useEffect(() => {
    const periodoURL = searchParams.get('periodo')
    if (periodoURL && periodoURL !== periodo) {
      setPeriodo(periodoURL)
      carregarDadosReais(periodoURL)
    }
  }, [searchParams])

  // 🔧 CORREÇÃO 5: Carregar dados iniciais apenas uma vez
  useEffect(() => {
    carregarDadosReais()
  }, []) // Só roda uma vez

  const periodos = [
    { valor: 'mes_atual', label: 'Mês Atual' },
    { valor: 'ultimo_mes', label: 'Último Mês' },
    { valor: 'trimestre', label: 'Último Trimestre' },
    { valor: 'semestre', label: 'Último Semestre' }
  ]

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#111827',
      color: 'white',
      padding: '1rem',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ 
        maxWidth: '1280px', 
        margin: '0 auto',
        width: '100%'
      }}>
        
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            flexShrink: 0
          }}>
            📊
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <h1 style={{
              fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
              fontWeight: 'bold',
              background: 'linear-gradient(to right, #c084fc, #60a5fa)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              margin: 0,
              lineHeight: 1.2
            }}>
              MEDWAY Executive
            </h1>
            <p style={{
              color: '#9ca3af',
              fontSize: 'clamp(0.875rem, 2.5vw, 1.125rem)',
              margin: '0.5rem 0 0 0'
            }}>
              Dashboard de Análise de Produtividade dos Terapeutas
            </p>
          </div>
        </div>

        {/* Status e Botões */}
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '0.75rem', 
          marginBottom: '2rem',
          alignItems: 'center',
          justifyContent: 'flex-start'
        }}>
          {/* 🔧 CORREÇÃO 6: Seletores de Período com feedback visual */}
          {periodos.map((p) => (
            <button
              key={p.valor}
              onClick={() => mudarPeriodo(p.valor)}
              disabled={loading}
              style={{
                padding: '0.75rem 1.25rem',
                borderRadius: '12px',
                fontWeight: '500',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                backgroundColor: periodo === p.valor ? '#7c3aed' : '#374151',
                color: periodo === p.valor ? 'white' : '#d1d5db',
                fontSize: '0.875rem',
                whiteSpace: 'nowrap',
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
          
          {/* Botão Conectar Supabase */}
          <button
            onClick={() => carregarDadosReais()}
            disabled={loading}
            style={{
              padding: '0.75rem 1.25rem',
              backgroundColor: loading ? '#6b7280' : '#059669',
              borderRadius: '12px',
              fontWeight: '500',
              border: 'none',
              color: 'white',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem',
              whiteSpace: 'nowrap'
            }}
          >
            <span style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }}>
              {loading ? '⏳' : '🔄'}
            </span>
            {loading ? 'Conectando...' : 'Atualizar Dados'}
          </button>

          {/* Link Debug */}
          <a
            href={`/debug?periodo=${periodo}`}
            style={{
              padding: '0.75rem 1.25rem',
              backgroundColor: '#d97706',
              borderRadius: '12px',
              fontWeight: '500',
              color: 'white',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              fontSize: '0.875rem',
              whiteSpace: 'nowrap'
            }}
          >
            🔧 Debug
          </a>
        </div>

        {/* 🔧 CORREÇÃO 7: Status melhorado com mais informações */}
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
            <button 
              onClick={() => carregarDadosReais()}
              style={{
                marginLeft: '1rem',
                padding: '0.25rem 0.5rem',
                backgroundColor: '#d97706',
                border: 'none',
                borderRadius: '6px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '0.75rem'
              }}
            >
              Tentar Novamente
            </button>
          </div>
        )}

        {/* Cards de Métricas */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
          width: '100%'
        }}>
          
          {/* Total de Atendimentos */}
          <div style={{
            background: 'linear-gradient(135deg, #1f2937, #111827)',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid #374151',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            width: '100%',
            boxSizing: 'border-box',
            position: 'relative'
          }}>
            {loading && (
              <div style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                animation: 'spin 1s linear infinite'
              }}>⏳</div>
            )}
            <h3 style={{
              color: '#d1d5db',
              fontSize: '0.875rem',
              fontWeight: '500',
              margin: '0 0 0.5rem 0'
            }}>
              Total de Atendimentos
            </h3>
            <div style={{
              fontSize: 'clamp(2rem, 5vw, 2.5rem)',
              fontWeight: 'bold',
              color: '#c084fc',
              margin: '0.25rem 0',
              lineHeight: 1
            }}>
              {metrics.totalAtendimentos.toLocaleString()}
            </div>
            <div style={{
              fontSize: '0.75rem',
              color: '#6b7280'
            }}>
              Período: {periodos.find(p => p.valor === periodo)?.label}
            </div>
          </div>

          {/* Alunos Únicos */}
          <div style={{
            background: 'linear-gradient(135deg, #1f2937, #111827)',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid #374151',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <h3 style={{
              color: '#d1d5db',
              fontSize: '0.875rem',
              fontWeight: '500',
              margin: '0 0 0.5rem 0'
            }}>
              Alunos Únicos
            </h3>
            <div style={{
              fontSize: 'clamp(2rem, 5vw, 2.5rem)',
              fontWeight: 'bold',
              color: '#10b981',
              margin: '0.25rem 0',
              lineHeight: 1
            }}>
              {metrics.alunosUnicos.toLocaleString()}
            </div>
            <div style={{
              fontSize: '0.75rem',
              color: '#6b7280'
            }}>
              Pacientes diferentes atendidos
            </div>
          </div>

          {/* 🔧 CORREÇÃO 8: Nota Média com tooltip explicativo */}
          <div style={{
            background: 'linear-gradient(135deg, #1f2937, #111827)',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid #374151',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <h3 style={{
              color: '#d1d5db',
              fontSize: '0.875rem',
              fontWeight: '500',
              margin: '0 0 0.5rem 0',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              Nota Média dos Alunos
              <span 
                title="0 = Alunos muito estáveis ✅ | 20 = Alunos em situação crítica ❌"
                style={{
                  cursor: 'help',
                  backgroundColor: '#374151',
                  borderRadius: '50%',
                  width: '16px',
                  height: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.7rem'
                }}
              >?</span>
            </h3>
            <div style={{
              fontSize: 'clamp(2rem, 5vw, 2.5rem)',
              fontWeight: 'bold',
              color: metrics.notaMediaAlunos <= 5 ? '#10b981' : 
                     metrics.notaMediaAlunos <= 10 ? '#fbbf24' : '#ef4444',
              margin: '0.25rem 0',
              lineHeight: 1
            }}>
              {metrics.notaMediaAlunos}
            </div>
            <div style={{
              fontSize: '0.75rem',
              color: '#6b7280'
            }}>
              Estabilidade média (0=estável, 20=crítico)
            </div>
          </div>

          {/* Terapeutas Ativos */}
          <div style={{
            background: 'linear-gradient(135deg, #1f2937, #111827)',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid #374151',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <h3 style={{
              color: '#d1d5db',
              fontSize: '0.875rem',
              fontWeight: '500',
              margin: '0 0 0.5rem 0'
            }}>
              Terapeutas Ativos
            </h3>
            <div style={{
              fontSize: 'clamp(2rem, 5vw, 2.5rem)',
              fontWeight: 'bold',
              color: '#60a5fa',
              margin: '0.25rem 0',
              lineHeight: 1
            }}>
              {metrics.terapeutasAtivos}
            </div>
            <div style={{
              fontSize: '0.75rem',
              color: '#6b7280'
            }}>
              Profissionais em atividade
            </div>
          </div>

        </div>

        {/* Seção de Análise Individual */}
        <div style={{
          background: 'linear-gradient(135deg, #1f2937, #111827)',
          borderRadius: '16px',
          padding: '2rem',
          border: '1px solid #374151',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <h2 style={{
              fontSize: 'clamp(1.25rem, 3vw, 1.5rem)',
              fontWeight: 'bold',
              color: 'white',
              margin: 0
            }}>
              👥 Análise Individual dos Terapeutas
            </h2>
            {/* 🔧 CORREÇÃO 9: Link mantém período na URL */}
            <a 
              href={`/executive?periodo=${periodo}`}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#7c3aed',
                borderRadius: '8px',
                fontWeight: '500',
                color: 'white',
                textDecoration: 'none',
                whiteSpace: 'nowrap'
              }}
            >
              Ver Detalhes →
            </a>
          </div>
          
          <div style={{ color: '#9ca3af' }}>
            <p style={{ margin: 0, lineHeight: 1.5 }}>
              Clique em "Ver Detalhes" para acessar a análise completa de cada terapeuta, 
              incluindo métricas individuais de performance e produtividade.
            </p>
          </div>
        </div>

        {/* 🔧 CORREÇÃO 10: Status da Conexão melhorado */}
        <div style={{
          marginTop: '2rem',
          textAlign: 'center',
          fontSize: '0.875rem',
          color: '#6b7280'
        }}>
          <p style={{ margin: 0 }}>
            {tentandoConectar ? '🔄 Conectando com Supabase...' :
             error ? '⚠️ Modo offline - dados locais' :
             '✅ Dashboard conectado - dados atualizados'}
          </p>
          <p style={{ margin: '0.25rem 0' }}>
            Período selecionado: <span style={{ color: '#c084fc', fontWeight: '500' }}>
              {periodos.find(p => p.valor === periodo)?.label}
            </span>
          </p>
          <p style={{ margin: '0.25rem 0' }}>
            Última atualização: {dataUltimaAtualizacao.toLocaleString('pt-BR')}
          </p>
        </div>

        {/* CSS para animação e responsividade */}
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          @media (max-width: 640px) {
            div[style*="padding: '1rem'"] {
              padding: 0.5rem !important;
            }
            
            div[style*="gap: '1.5rem'"] {
              gap: 1rem !important;
            }
            
            div[style*="padding: '2rem'"] {
              padding: 1rem !important;
            }
          }
          
          @media (max-width: 480px) {
            div[style*="gridTemplateColumns"] {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>

      </div>
    </div>
  )
}
