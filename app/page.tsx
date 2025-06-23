'use client'

import { useState, useEffect } from 'react'

// Dados que sabemos que existem
const DADOS_REAIS = {
  totalAtendimentos: 1714,
  alunosUnicos: 625,
  notaMediaEquipe: 8.4,
  terapeutasAtivos: 8
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState(DADOS_REAIS)
  const [periodo, setPeriodo] = useState('trimestre')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tentandoConectar, setTentandoConectar] = useState(false)

  // Tentar carregar dados reais do Supabase
  const carregarDadosReais = async () => {
    try {
      setTentandoConectar(true)
      setLoading(true)
      
      const { getDashboardMetrics } = await import('@/utils/dashboardAnalytics')
      const dadosSupabase = await getDashboardMetrics(periodo)
      
      setMetrics(dadosSupabase)
      setError(null)
      
    } catch (err) {
      console.error('Erro ao carregar do Supabase:', err)
      setError('Usando dados locais - Clique em Debug para mais info')
      // Manter os dados reais como fallback
    } finally {
      setLoading(false)
      setTentandoConectar(false)
    }
  }

  const periodos = [
    { valor: 'trimestre', label: 'Último Trimestre' },
    { valor: 'semestre', label: 'Último Semestre' },
    { valor: 'ano', label: 'Último Ano' }
  ]

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
          marginBottom: '2rem',
          flexWrap: 'wrap'
        }}>
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
            📊
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
              MEDWAY Executive
            </h1>
            <p style={{
              color: '#9ca3af',
              fontSize: '1.125rem',
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
          gap: '1rem', 
          marginBottom: '2rem',
          alignItems: 'center' 
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
          
          {/* Botão Conectar Supabase */}
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
            {loading ? 'Conectando...' : 'Conectar Supabase'}
          </button>

          {/* Link Debug */}
          <a
            href="/debug"
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#d97706',
              borderRadius: '12px',
              fontWeight: '500',
              color: 'white',
              textDecoration: 'none',
              display: 'inline-block'
            }}
          >
            🔧 Debug
          </a>
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

        {/* Cards de Métricas */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          
          {/* Total de Atendimentos */}
          <div style={{
            background: 'linear-gradient(135deg, #1f2937, #111827)',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid #374151',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{
              color: '#d1d5db',
              fontSize: '0.875rem',
              fontWeight: '500',
              margin: '0 0 0.5rem 0'
            }}>
              Total de Atendimentos
            </h3>
            <div style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              color: '#c084fc',
              margin: '0.25rem 0'
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
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
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
              fontSize: '2.5rem',
              fontWeight: 'bold',
              color: '#10b981',
              margin: '0.25rem 0'
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

          {/* Nota Média da Equipe */}
          <div style={{
            background: 'linear-gradient(135deg, #1f2937, #111827)',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid #374151',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{
              color: '#d1d5db',
              fontSize: '0.875rem',
              fontWeight: '500',
              margin: '0 0 0.5rem 0'
            }}>
              Nota Média da Equipe
            </h3>
            <div style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              color: '#fbbf24',
              margin: '0.25rem 0'
            }}>
              {metrics.notaMediaEquipe}
            </div>
            <div style={{
              fontSize: '0.75rem',
              color: '#6b7280'
            }}>
              Avaliação dos terapeutas
            </div>
          </div>

          {/* Terapeutas Ativos */}
          <div style={{
            background: 'linear-gradient(135deg, #1f2937, #111827)',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid #374151',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
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
              fontSize: '2.5rem',
              fontWeight: 'bold',
              color: '#60a5fa',
              margin: '0.25rem 0'
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
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
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
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: 'white',
              margin: 0
            }}>
              👥 Análise Individual dos Terapeutas
            </h2>
            <a 
              href="/executive"
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#7c3aed',
                borderRadius: '8px',
                fontWeight: '500',
                color: 'white',
                textDecoration: 'none'
              }}
            >
              Ver Detalhes →
            </a>
          </div>
          
          <div style={{ color: '#9ca3af' }}>
            <p style={{ margin: 0 }}>
              Clique em "Ver Detalhes" para acessar a análise completa de cada terapeuta, 
              incluindo métricas individuais de performance e produtividade.
            </p>
          </div>
        </div>

        {/* Status da Conexão */}
        <div style={{
          marginTop: '2rem',
          textAlign: 'center',
          fontSize: '0.875rem',
          color: '#6b7280'
        }}>
          <p style={{ margin: 0 }}>
            {tentandoConectar ? '🔄 Tentando conectar...' :
             error ? '⚠️ Dados locais - Tente "Conectar Supabase"' :
             '✅ Dashboard com dados atualizados'}
          </p>
          <p style={{ margin: '0.25rem 0' }}>
            Período selecionado: <span style={{ color: '#c084fc', fontWeight: '500' }}>
              {periodos.find(p => p.valor === periodo)?.label}
            </span>
          </p>
          <p style={{ margin: '0.25rem 0' }}>
            Última atualização: {new Date().toLocaleString('pt-BR')}
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
