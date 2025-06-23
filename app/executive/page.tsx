'use client'

import { useState, useEffect } from 'react'
import { getTerapeutasStats, TerapeutaStats } from '@/utils/dashboardAnalytics'

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
    if (nota >= 8) return 'text-green-400'
    if (nota >= 6) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getStatusText = (nota: number) => {
    if (nota >= 8) return 'Excelente'
    if (nota >= 6) return 'Bom'
    return 'Precisa Melhorar'
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mr-4">
              <div className="text-2xl">👥</div>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Análise Individual dos Terapeutas
              </h1>
              <p className="text-gray-400 text-lg">
                Performance e produtividade detalhada por terapeuta
              </p>
            </div>
          </div>
          
          {/* Botão Voltar */}
          <a 
            href="/"
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-all"
          >
            ← Voltar ao Dashboard
          </a>
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
          
          <button
            onClick={carregarDados}
            disabled={loading}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-xl font-medium transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <span className={loading ? 'animate-spin' : ''}>🔄</span>
            Atualizar
          </button>
        </div>

        {/* Loading/Error */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-2 text-purple-400">
              <span className="animate-spin">⏳</span>
              Carregando dados dos terapeutas...
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
          </div>
        )}

        {/* Cards dos Terapeutas */}
        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {terapeutas.map((terapeuta) => (
                <div
                  key={terapeuta.terapeuta_id}
                  className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">
                      Terapeuta {terapeuta.terapeuta_id}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(terapeuta.nota_media)}`}>
                      {getStatusText(terapeuta.nota_media)}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {/* Total de Atendimentos */}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Atendimentos:</span>
                      <span className="text-purple-400 font-bold text-lg">
                        {terapeuta.total_atendimentos}
                      </span>
                    </div>

                    {/* Alunos Únicos */}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Alunos Únicos:</span>
                      <span className="text-green-400 font-bold text-lg">
                        {terapeuta.alunos_unicos}
                      </span>
                    </div>

                    {/* Nota Média */}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Nota Média:</span>
                      <span className={`font-bold text-lg ${getStatusColor(terapeuta.nota_media)}`}>
                        {terapeuta.nota_media}
                      </span>
                    </div>

                    {/* Atendimentos por Aluno */}
                    <div className="flex justify-between items-center pt-2 border-t border-gray-700">
                      <span className="text-gray-400">Atend./Aluno:</span>
                      <span className="text-blue-400 font-bold">
                        {(terapeuta.total_atendimentos / terapeuta.alunos_unicos).toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Resumo Estatístico */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-6">📊 Resumo Estatístico</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">
                    {terapeutas.reduce((sum, t) => sum + t.total_atendimentos, 0).toLocaleString()}
                  </div>
                  <div className="text-gray-400">Total de Atendimentos</div>
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    {terapeutas.reduce((sum, t) => sum + t.alunos_unicos, 0).toLocaleString()}
                  </div>
                  <div className="text-gray-400">Total de Alunos Únicos</div>
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400 mb-2">
                    {terapeutas.length > 0 
                      ? (terapeutas.reduce((sum, t) => sum + t.nota_media, 0) / terapeutas.length).toFixed(1)
                      : '0'
                    }
                  </div>
                  <div className="text-gray-400">Nota Média Geral</div>
                </div>
              </div>
            </div>

            {/* Ranking */}
            <div className="mt-8 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-6">🏆 Ranking de Performance</h2>
              
              <div className="space-y-4">
                {terapeutas
                  .sort((a, b) => b.nota_media - a.nota_media)
                  .map((terapeuta, index) => (
                    <div 
                      key={terapeuta.terapeuta_id}
                      className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          index === 0 ? 'bg-yellow-500 text-black' :
                          index === 1 ? 'bg-gray-400 text-black' :
                          index === 2 ? 'bg-orange-600 text-white' :
                          'bg-gray-600 text-white'
                        }`}>
                          {index + 1}
                        </div>
                        <span className="font-medium">Terapeuta {terapeuta.terapeuta_id}</span>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm">
                        <span className="text-gray-400">
                          {terapeuta.total_atendimentos} atendimentos
                        </span>
                        <span className={`font-bold ${getStatusColor(terapeuta.nota_media)}`}>
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
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>
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
