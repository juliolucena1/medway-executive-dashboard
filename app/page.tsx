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
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mr-4">
            <div className="text-2xl">📊</div>
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              MEDWAY Executive
            </h1>
            <p className="text-gray-400 text-lg">
              Dashboard de Análise de Produtividade dos Terapeutas
            </p>
          </div>
        </div>

        {/* Seletores de Período */}
        <div className="flex flex-wrap gap-4 mb-8">
          {periodos.map((p) => (
            <button
              key={p.valor}
              onClick={() => setPeriodo(p.valor)}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                periodo === p.valor
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {p.label}
            </button>
          ))}
          
          {/* Botão Atualizar */}
          <button
            onClick={carregarDados}
            disabled={loading}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-xl font-medium transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <span className={loading ? 'animate-spin' : ''}>🔄</span>
            Atualizar
          </button>

          {/* Link para Debug */}
          <a
            href="/debug"
            className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 rounded-xl font-medium transition-all"
          >
            🔧 Debug
          </a>
        </div>

        {/* Indicador de Loading/Erro */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-2 text-purple-400">
              <span className="animate-spin">⏳</span>
              Carregando dados do Supabase...
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-900/50 border border-red-500 rounded-xl p-4 mb-8">
            <p className="text-red-200">⚠️ {error}</p>
            <button 
              onClick={carregarDados}
              className="mt-2 text-red-400 hover:text-red-300 underline"
            >
              Tentar novamente
            </button>
            <div className="mt-2 text-sm text-red-300">
              💡 Se o erro persistir, acesse o <a href="/debug" className="underline">Debug</a> para mais informações
            </div>
          </div>
        )}

        {/* Cards de Métricas - LAYOUT IGUAL À IMAGEM 1 */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            
            {/* Total de Atendimentos */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700">
              <h3 className="text-gray-300 text-sm font-medium mb-2">Total de Atendimentos</h3>
              <div className="text-4xl font-bold text-purple-400 mb-1">
                {metrics.totalAtendimentos.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">
                Período: {periodos.find(p => p.valor === periodo)?.label}
              </div>
            </div>

            {/* Alunos Únicos */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700">
              <h3 className="text-gray-300 text-sm font-medium mb-2">Alunos Únicos</h3>
              <div className="text-4xl font-bold text-green-400 mb-1">
                {metrics.alunosUnicos.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">
                Pacientes diferentes atendidos
              </div>
            </div>

            {/* Nota Média da Equipe */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700">
              <h3 className="text-gray-300 text-sm font-medium mb-2">Nota Média da Equipe</h3>
              <div className="text-4xl font-bold text-yellow-400 mb-1">
                {metrics.notaMediaEquipe}
              </div>
              <div className="text-xs text-gray-500">
                Avaliação dos terapeutas
              </div>
            </div>

            {/* Terapeutas Ativos */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700">
              <h3 className="text-gray-300 text-sm font-medium mb-2">Terapeutas Ativos</h3>
              <div className="text-4xl font-bold text-blue-400 mb-1">
                {metrics.terapeutasAtivos}
              </div>
              <div className="text-xs text-gray-500">
                Profissionais em atividade
              </div>
            </div>

          </div>
        )}

        {/* Seção de Análise Individual */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              👥 Análise Individual dos Terapeutas
            </h2>
            <a 
              href="/executive"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-all"
            >
              Ver Detalhes →
            </a>
          </div>
          
          <div className="text-gray-400">
            <p>
              Clique em "Ver Detalhes" para acessar a análise completa de cada terapeuta, 
              incluindo métricas individuais de performance e produtividade.
            </p>
          </div>
        </div>

        {/* Status da Conexão */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>✅ Dashboard conectado ao Supabase em tempo real</p>
          <p className="mt-1">
            Período selecionado: <span className="text-purple-400 font-medium">
              {periodos.find(p => p.valor === periodo)?.label}
            </span>
          </p>
          <p className="mt-1">
            Dados atualizados em: {new Date().toLocaleString('pt-BR')}
          </p>
        </div>

      </div>
    </div>
  )
}
