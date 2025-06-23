// app/page.tsx - Dashboard Principal com Layout Corrigido
'use client'

import { useState, useEffect } from 'react'
import { getDashboardMetrics, DashboardMetrics } from '@/utils/dashboardAnalytics'

export default function Dashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalAtendimentos: 0,
    alunosUnicos: 0,
    notaMediaEquipe: 0,
    terapeutasAtivos: 0
  })
  
  const [periodo, setPeriodo] = useState('trimestre')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Função para carregar os dados
  const carregarDados = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🔄 Carregando métricas do período:', periodo)
      const dadosCalculados = await getDashboardMetrics(periodo)
      
      console.log('✅ Métricas carregadas:', dadosCalculados)
      setMetrics(dadosCalculados)
      
    } catch (err) {
      console.error('❌ Erro ao carregar dados:', err)
      setError('Erro ao carregar dados do dashboard. Verifique a conexão com o Supabase.')
    } finally {
      setLoading(false)
    }
  }

  // Carregar dados quando o componente monta ou período muda
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

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#111827',
      color: 'white',
      padding: '2rem'
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: '2rem' 
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
          
          {/* Botão Atualizar */}
          <button
            onClick={carregarDados}
            disabled={loading}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#059669',
              borderRadius: '12px',
              fontWeight: '500',
              border: 'none',
              color: 'white',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <span style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }}>🔄</span>
            Atualizar
          </button>

          {/* Link para Debug */}
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

        {/* Indicador de Loading/Erro */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              color: '#c084fc' 
            }}>
              <span style={{ animation: 'spin 1s linear infinite' }}>⏳</span>
              Carregando dados do Supabase...
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
            <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#fca5a5' }}>
              💡 Se o erro persistir, acesse o <a href="/debug" style={{ textDecoration: 'underline' }}>Debug</a> para mais informações
            </div>
          </div>
        )}

        {/* Cards de Métricas */}
        {!loading && !error && (
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
              border: '1px solid #374151'
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
              border: '1px solid #374151'
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
              border: '1px solid #374151'
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
              border: '1px solid #374151'
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
        )}

        {/* Seção de Análise Individual */}
        <div style={{
          background: 'linear-gradient(135deg, #1f2937, #111827)',
          borderRadius: '16px',
          padding: '2rem',
          border: '1px solid #374151'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem'
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
          <p style={{ margin: 0 }}>✅ Dashboard conectado ao Supabase em tempo real</p>
          <p style={{ margin: '0.25rem 0' }}>
            Período selecionado: <span style={{ color: '#c084fc', fontWeight: '500' }}>
              {periodos.find(p => p.valor === periodo)?.label}
            </span>
          </p>
          <p style={{ margin: '0.25rem 0' }}>
            Dados atualizados em: {new Date().toLocaleString('pt-BR')}
          </p>
        </div>

        {/* CSS para animação de spin */}
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
