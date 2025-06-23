// utils/dashboardAnalytics.ts - VERSÃO COM FILTROS CORRIGIDOS + NOTA INTERPRETADA CORRETAMENTE
import { supabase } from '@/lib/supabase'

export interface DashboardMetrics {
  totalAtendimentos: number
  alunosUnicos: number
  notaMediaAlunos: number // 🔄 MUDOU: agora é nota dos alunos, não dos terapeutas
  terapeutasAtivos: number
}

export interface TerapeutaStats {
  terapeuta_id: number
  nome_terapeuta: string
  total_atendimentos: number
  alunos_unicos: number
  nota_media_alunos: number // 🔄 MUDOU: nota média dos alunos atendidos
}

// 🏷️ MAPEAMENTO DOS NOMES DOS TERAPEUTAS
const NOMES_TERAPEUTAS: Record<number, string> = {
  1: 'Júlio Lucena',
  3: 'Bia Bezerra', 
  4: 'Bia Londres',
  5: 'Davi Belo',
  6: 'Carol Gomes',
  7: 'Dani Matias',
  10: 'Olga Gomes',
  11: 'Maria Eduarda Costa'
}

// Função para obter nome do terapeuta
export function getNomeTerapeuta(id: number): string {
  return NOMES_TERAPEUTAS[id] || `Terapeuta ${id}`
}

// 📊 FUNÇÃO PARA INTERPRETAR NOTA DOS ALUNOS (0-20, onde 0 é melhor)
export function interpretarNotaAluno(nota: number): { status: string, cor: string } {
  if (nota <= 5) return { status: 'Excelente', cor: '#10b981' } // Verde - alunos estáveis
  if (nota <= 10) return { status: 'Bom', cor: '#fbbf24' } // Amarelo - situação média
  if (nota <= 15) return { status: 'Atenção', cor: '#ea580c' } // Laranja - precisa atenção
  return { status: 'Crítico', cor: '#ef4444' } // Vermelho - situação crítica
}

// 📅 FUNÇÃO AUXILIAR CORRIGIDA - Filtros de data funcionando
function getDataInicio(periodo: string): string | null {
  const hoje = new Date()
  console.log('🔍 Calculando data de início para período:', periodo, 'Data atual:', hoje.toISOString())
  
  switch (periodo) {
    case 'mes_atual':
      // Primeiro dia do mês atual às 00:00:00
      const inicioMesAtual = new Date(hoje.getFullYear(), hoje.getMonth(), 1, 0, 0, 0, 0)
      console.log('📅 Mês atual - início:', inicioMesAtual.toISOString())
      return inicioMesAtual.toISOString()
      
    case 'ultimo_mes':
      // Primeiro dia do mês passado às 00:00:00
      const inicioMesPassado = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1, 0, 0, 0, 0)
      // Último dia do mês passado às 23:59:59
      const fimMesPassado = new Date(hoje.getFullYear(), hoje.getMonth(), 0, 23, 59, 59, 999)
      console.log('📅 Último mês - de:', inicioMesPassado.toISOString(), 'até:', fimMesPassado.toISOString())
      return inicioMesPassado.toISOString()
      
    case 'trimestre':
      // Últimos 90 dias
      const inicioTrimestre = new Date(hoje)
      inicioTrimestre.setDate(hoje.getDate() - 90)
      inicioTrimestre.setHours(0, 0, 0, 0)
      console.log('📅 Trimestre - início:', inicioTrimestre.toISOString())
      return inicioTrimestre.toISOString()
      
    case 'semestre':
      // Últimos 180 dias
      const inicioSemestre = new Date(hoje)
      inicioSemestre.setDate(hoje.getDate() - 180)
      inicioSemestre.setHours(0, 0, 0, 0)
      console.log('📅 Semestre - início:', inicioSemestre.toISOString())
      return inicioSemestre.toISOString()
      
    default:
      console.log('📅 Sem filtro - todos os dados')
      return null // Retorna todos os dados
  }
}

// Função principal para buscar todas as métricas do dashboard
export async function getDashboardMetrics(periodo: string = 'mes_atual'): Promise<DashboardMetrics> {
  try {
    console.log('🔍 Buscando métricas para o período:', periodo)
    
    // Calcular data de início baseada no período
    const dataInicio = getDataInicio(periodo)
    
    // Query base com filtro de período
    let query = supabase
      .from('student_records')
      .select('*')
      .order('data_consulta', { ascending: false })
    
    // 🔧 APLICAR FILTRO DE DATA SE ESPECIFICADO
    if (dataInicio) {
      if (periodo === 'ultimo_mes') {
        // Para último mês, filtrar apenas o mês passado completo
        const inicioMesPassado = new Date()
        inicioMesPassado.setMonth(inicioMesPassado.getMonth() - 1, 1)
        inicioMesPassado.setHours(0, 0, 0, 0)
        
        const fimMesPassado = new Date()
        fimMesPassado.setDate(0) // Último dia do mês passado
        fimMesPassado.setHours(23, 59, 59, 999)
        
        query = query
          .gte('data_consulta', inicioMesPassado.toISOString())
          .lte('data_consulta', fimMesPassado.toISOString())
      } else {
        // Para outros períodos, filtrar a partir da data de início
        query = query.gte('data_consulta', dataInicio)
      }
    }

    console.log('📡 Executando query com filtros...')

    // 🔥 BUSCAR TODOS OS DADOS SEM LIMITE
    let allData: any[] = []
    let from = 0
    const limit = 1000
    let hasMore = true

    while (hasMore) {
      const { data: batch, error } = await query.range(from, from + limit - 1)
      
      if (error) {
        console.error('❌ Erro ao buscar dados:', error)
        throw error
      }

      if (batch && batch.length > 0) {
        allData = [...allData, ...batch]
        console.log(`📦 Lote ${Math.floor(from/limit) + 1}: ${batch.length} registros (total: ${allData.length})`)
        
        if (batch.length < limit) {
          hasMore = false
        } else {
          from += limit
        }
      } else {
        hasMore = false
      }
    }

    const consultas = allData

    if (!consultas || consultas.length === 0) {
      console.log('⚠️ Nenhum dado encontrado para o período')
      return {
        totalAtendimentos: 0,
        alunosUnicos: 0,
        notaMediaAlunos: 0,
        terapeutasAtivos: 0
      }
    }

    console.log('✅ Total de registros processados:', consultas.length)
    console.log('📅 Primeiro registro:', consultas[consultas.length - 1]?.data_consulta)
    console.log('📅 Último registro:', consultas[0]?.data_consulta)

    // 1. Total de Atendimentos
    const totalAtendimentos = consultas.length

    // 2. Alunos Únicos
    const alunosUnicosSet = new Set(consultas.map(c => c.aluno_id))
    const alunosUnicos = alunosUnicosSet.size

    // 3. 🔄 NOTA MÉDIA DOS ALUNOS (nota_terapeuta na verdade é nota do aluno)
    const notasValidas = consultas
      .map(c => c.nota_terapeuta)
      .filter(nota => nota !== null && nota !== undefined && !isNaN(nota))
    
    const notaMediaAlunos = notasValidas.length > 0 
      ? notasValidas.reduce((sum, nota) => sum + nota, 0) / notasValidas.length 
      : 0

    // 4. Terapeutas Ativos
    const terapeutasAtivosSet = new Set(consultas.map(c => c.terapeuta_id))
    const terapeutasAtivos = terapeutasAtivosSet.size

    const metricas = {
      totalAtendimentos,
      alunosUnicos,
      notaMediaAlunos: Math.round(notaMediaAlunos * 10) / 10,
      terapeutasAtivos
    }

    console.log('📊 Métricas calculadas:', metricas)
    return metricas

  } catch (error) {
    console.error('❌ Erro ao calcular métricas:', error)
    throw error
  }
}

// Função para buscar estatísticas por terapeuta
export async function getTerapeutasStats(periodo: string = 'mes_atual'): Promise<TerapeutaStats[]> {
  try {
    console.log('🔍 Buscando stats dos terapeutas para período:', periodo)
    const dataInicio = getDataInicio(periodo)
    
    let query = supabase
      .from('student_records')
      .select('terapeuta_id, aluno_id, nota_terapeuta, data_consulta')
      .order('data_consulta', { ascending: false })
    
    // Aplicar mesmo filtro de data
    if (dataInicio) {
      if (periodo === 'ultimo_mes') {
        const inicioMesPassado = new Date()
        inicioMesPassado.setMonth(inicioMesPassado.getMonth() - 1, 1)
        inicioMesPassado.setHours(0, 0, 0, 0)
        
        const fimMesPassado = new Date()
        fimMesPassado.setDate(0)
        fimMesPassado.setHours(23, 59, 59, 999)
        
        query = query
          .gte('data_consulta', inicioMesPassado.toISOString())
          .lte('data_consulta', fimMesPassado.toISOString())
      } else {
        query = query.gte('data_consulta', dataInicio)
      }
    }

    // 🔥 BUSCAR TODOS OS DADOS SEM LIMITE
    let allData: any[] = []
    let from = 0
    const limit = 1000
    let hasMore = true

    while (hasMore) {
      const { data: batch, error } = await query.range(from, from + limit - 1)
      
      if (error) throw error

      if (batch && batch.length > 0) {
        allData = [...allData, ...batch]
        if (batch.length < limit) {
          hasMore = false
        } else {
          from += limit
        }
      } else {
        hasMore = false
      }
    }

    const consultas = allData
    if (!consultas) return []

    console.log('📊 Processando', consultas.length, 'consultas para stats dos terapeutas')

    // Agrupar por terapeuta
    const terapeutasMap = new Map<number, any[]>()
    
    consultas.forEach(consulta => {
      const terapeutaId = consulta.terapeuta_id
      if (!terapeutasMap.has(terapeutaId)) {
        terapeutasMap.set(terapeutaId, [])
      }
      terapeutasMap.get(terapeutaId)!.push(consulta)
    })

    // Calcular estatísticas para cada terapeuta
    const terapeutasStats: TerapeutaStats[] = []
    
    terapeutasMap.forEach((atendimentos, terapeutaId) => {
      const alunosUnicosSet = new Set(atendimentos.map(a => a.aluno_id))
      const notasValidas = atendimentos
        .map(a => a.nota_terapeuta)
        .filter(nota => nota !== null && !isNaN(nota))
      
      const notaMediaAlunos = notasValidas.length > 0 
        ? notasValidas.reduce((sum, nota) => sum + nota, 0) / notasValidas.length 
        : 0

      terapeutasStats.push({
        terapeuta_id: terapeutaId,
        nome_terapeuta: getNomeTerapeuta(terapeutaId),
        total_atendimentos: atendimentos.length,
        alunos_unicos: alunosUnicosSet.size,
        nota_media_alunos: Math.round(notaMediaAlunos * 10) / 10
      })
    })

    // Ordenar por total de atendimentos (decrescente)
    const statsOrdenados = terapeutasStats.sort((a, b) => b.total_atendimentos - a.total_atendimentos)
    
    console.log('📋 Stats calculados:', statsOrdenados.length, 'terapeutas')
    return statsOrdenados

  } catch (error) {
    console.error('❌ Erro ao buscar stats dos terapeutas:', error)
    throw error
  }
}

// Função para buscar análise individual dos terapeutas (para página executive)
export async function getAnaliseIndividual(periodo: string = 'mes_atual') {
  try {
    const terapeutasStats = await getTerapeutasStats(periodo)
    
    return terapeutasStats.map(stats => ({
      id: stats.terapeuta_id,
      nome: stats.nome_terapeuta,
      atendimentos: stats.total_atendimentos,
      alunosUnicos: stats.alunos_unicos,
      notaMediaAlunos: stats.nota_media_alunos,
      interpretacao: interpretarNotaAluno(stats.nota_media_alunos)
    }))

  } catch (error) {
    console.error('❌ Erro ao buscar análise individual:', error)
    throw error
  }
}
