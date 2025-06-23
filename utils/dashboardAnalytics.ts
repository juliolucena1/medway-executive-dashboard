// utils/dashboardAnalytics.ts - VERSÃO COM NOMES REAIS DOS TERAPEUTAS
import { supabase } from '@/lib/supabase'

export interface DashboardMetrics {
  totalAtendimentos: number
  alunosUnicos: number
  notaMediaEquipe: number
  terapeutasAtivos: number
}

export interface TerapeutaStats {
  terapeuta_id: number
  nome_terapeuta: string
  total_atendimentos: number
  alunos_unicos: number
  nota_media: number
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

// ⚠️ IMPORTANTE: Verifique se 'student_records' é o nome correto da sua tabela no Supabase

// Função principal para buscar todas as métricas do dashboard
export async function getDashboardMetrics(periodo: string = 'trimestre'): Promise<DashboardMetrics> {
  try {
    console.log('🔍 Buscando métricas para o período:', periodo)
    
    // Calcular data de início baseada no período
    const dataInicio = getDataInicio(periodo)
    
    // Query base com filtro de período - SEM LIMITE para pegar todos os dados
    let query = supabase
      .from('consulta') // ⚠️ NOME DA TABELA - VERIFICAR SE ESTÁ CORRETO
      .select('*')
      .order('data_consulta', { ascending: false })
    
    if (dataInicio) {
      query = query.gte('data_consulta', dataInicio)
    }

    // 🔥 BUSCAR TODOS OS DADOS SEM LIMITE
    console.log('📊 Buscando TODOS os registros (sem limite de 1000)...')
    let allData: any[] = []
    let from = 0
    const limit = 1000 // Buscar em lotes de 1000
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
        
        // Se retornou menos que o limit, chegamos ao fim
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
        notaMediaEquipe: 0,
        terapeutasAtivos: 0
      }
    }

    console.log('✅ Total de registros processados:', consultas.length)

    // 1. Total de Atendimentos
    const totalAtendimentos = consultas.length

    // 2. Alunos Únicos
    const alunosUnicosSet = new Set(consultas.map(c => c.aluno_id))
    const alunosUnicos = alunosUnicosSet.size

    // 3. Nota Média da Equipe
    const notasValidas = consultas
      .map(c => c.nota_terapeuta)
      .filter(nota => nota !== null && nota !== undefined && !isNaN(nota))
    
    const notaMediaEquipe = notasValidas.length > 0 
      ? notasValidas.reduce((sum, nota) => sum + nota, 0) / notasValidas.length 
      : 0

    // 4. Terapeutas Ativos
    const terapeutasAtivosSet = new Set(consultas.map(c => c.terapeuta_id))
    const terapeutasAtivos = terapeutasAtivosSet.size

    const metricas = {
      totalAtendimentos,
      alunosUnicos,
      notaMediaEquipe: Math.round(notaMediaEquipe * 10) / 10, // Arredondar para 1 casa decimal
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
export async function getTerapeutasStats(periodo: string = 'trimestre'): Promise<TerapeutaStats[]> {
  try {
    const dataInicio = getDataInicio(periodo)
    
    let query = supabase
      .from('consulta') // ⚠️ NOME DA TABELA - VERIFICAR SE ESTÁ CORRETO
      .select('terapeuta_id, aluno_id, nota_terapeuta, data_consulta')
      .order('data_consulta', { ascending: false })
    
    if (dataInicio) {
      query = query.gte('data_consulta', dataInicio)
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
      
      const notaMedia = notasValidas.length > 0 
        ? notasValidas.reduce((sum, nota) => sum + nota, 0) / notasValidas.length 
        : 0

      terapeutasStats.push({
        terapeuta_id: terapeutaId,
        nome_terapeuta: getNomeTerapeuta(terapeutaId),
        total_atendimentos: atendimentos.length,
        alunos_unicos: alunosUnicosSet.size,
        nota_media: Math.round(notaMedia * 10) / 10
      })
    })

    // Ordenar por total de atendimentos (decrescente)
    return terapeutasStats.sort((a, b) => b.total_atendimentos - a.total_atendimentos)

  } catch (error) {
    console.error('❌ Erro ao buscar stats dos terapeutas:', error)
    throw error
  }
}

// 📅 FUNÇÃO AUXILIAR ATUALIZADA - Novos períodos incluindo mês atual
function getDataInicio(periodo: string): string | null {
  const hoje = new Date()
  
  switch (periodo) {
    case 'mes_atual':
      // Primeiro dia do mês atual
      const inicioMesAtual = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
      return inicioMesAtual.toISOString()
      
    case 'ultimo_mes':
      // Primeiro dia do mês passado
      const inicioMesPassado = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1)
      return inicioMesPassado.toISOString()
      
    case 'semana':
      const inicioSemana = new Date(hoje)
      inicioSemana.setDate(hoje.getDate() - 7)
      return inicioSemana.toISOString()
      
    case 'trimestre':
      const inicioTrimestre = new Date(hoje)
      inicioTrimestre.setMonth(hoje.getMonth() - 3)
      return inicioTrimestre.toISOString()
      
    case 'semestre':
      const inicioSemestre = new Date(hoje)
      inicioSemestre.setMonth(hoje.getMonth() - 6)
      return inicioSemestre.toISOString()
      
    case 'ano':
      const inicioAno = new Date(hoje)
      inicioAno.setFullYear(hoje.getFullYear() - 1)
      return inicioAno.toISOString()
      
    default:
      return null // Retorna todos os dados
  }
}

// Função para buscar análise individual dos terapeutas (para página executive)
export async function getAnaliseIndividual(periodo: string = 'trimestre') {
  try {
    const terapeutasStats = await getTerapeutasStats(periodo)
    
    return terapeutasStats.map(stats => ({
      id: stats.terapeuta_id,
      nome: stats.nome_terapeuta, // 🎯 AGORA USA O NOME REAL
      atendimentos: stats.total_atendimentos,
      alunosUnicos: stats.alunos_unicos,
      notaMedia: stats.nota_media,
      status: stats.nota_media >= 8 ? 'Excelente' : 
              stats.nota_media >= 6 ? 'Bom' : 'Precisa Melhorar'
    }))

  } catch (error) {
    console.error('❌ Erro ao buscar análise individual:', error)
    throw error
  }
}
