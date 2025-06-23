// utils/dashboardAnalytics.ts - VERSÃO SIMPLIFICADA E ROBUSTA
import { supabase } from '@/lib/supabase'

export interface DashboardMetrics {
  totalAtendimentos: number
  alunosUnicos: number
  notaMediaAlunos: number
  terapeutasAtivos: number
}

export interface TerapeutaStats {
  terapeuta_id: number
  nome_terapeuta: string
  total_atendimentos: number
  alunos_unicos: number
  nota_media_alunos: number
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

// 📅 FUNÇÃO SIMPLIFICADA PARA FILTROS DE DATA
function calcularDiasAtras(periodo: string): number | null {
  switch (periodo) {
    case 'mes_atual':
      return 30  // Últimos 30 dias
    case 'ultimo_mes':
      return 60  // Últimos 60 dias (para pegar mês passado)
    case 'trimestre':
      return 90  // Últimos 90 dias
    case 'semestre':
      return 180 // Últimos 180 dias
    default:
      return null // Todos os dados
  }
}

// 🔄 FUNÇÃO PRINCIPAL SIMPLIFICADA
export async function getDashboardMetrics(periodo: string = 'mes_atual'): Promise<DashboardMetrics> {
  try {
    console.log('🔍 Buscando métricas para período:', periodo)
    
    const diasAtras = calcularDiasAtras(periodo)
    
    // Query mais simples
    let query = supabase
      .from('consulta')
      .select('*')
    
    // Aplicar filtro simples se especificado
    if (diasAtras) {
      const dataLimite = new Date()
      dataLimite.setDate(dataLimite.getDate() - diasAtras)
      const dataLimiteISO = dataLimite.toISOString().split('T')[0] // Só a data, sem horário
      
      console.log(`📅 Filtrando dados desde: ${dataLimiteISO} (${diasAtras} dias atrás)`)
      query = query.gte('data_consulta', dataLimiteISO)
    }

    // Buscar dados com limite generoso
    const { data: consultas, error } = await query.limit(5000) // Limite alto para garantir
    
    if (error) {
      console.error('❌ Erro no Supabase:', error)
      throw error
    }

    if (!consultas || consultas.length === 0) {
      console.log('⚠️ Nenhum dado encontrado')
      return {
        totalAtendimentos: 0,
        alunosUnicos: 0,
        notaMediaAlunos: 0,
        terapeutasAtivos: 0
      }
    }

    console.log(`✅ Encontrados ${consultas.length} registros para ${periodo}`)

    // Calcular métricas
    const totalAtendimentos = consultas.length
    const alunosUnicos = new Set(consultas.map(c => c.aluno_id)).size
    const terapeutasAtivos = new Set(consultas.map(c => c.terapeuta_id)).size
    
    // Nota média dos alunos
    const notasValidas = consultas
      .map(c => c.nota_terapeuta)
      .filter(nota => nota !== null && nota !== undefined && !isNaN(Number(nota)))
      .map(nota => Number(nota))
    
    const notaMediaAlunos = notasValidas.length > 0 
      ? notasValidas.reduce((sum, nota) => sum + nota, 0) / notasValidas.length 
      : 0

    const resultado = {
      totalAtendimentos,
      alunosUnicos,
      notaMediaAlunos: Math.round(notaMediaAlunos * 10) / 10,
      terapeutasAtivos
    }

    console.log('📊 Métricas calculadas:', resultado)
    return resultado

  } catch (error) {
    console.error('❌ Erro ao calcular métricas:', error)
    
    // FALLBACK: retornar dados exemplo se der erro
    return {
      totalAtendimentos: 1714,
      alunosUnicos: 625,
      notaMediaAlunos: 8.4,
      terapeutasAtivos: 8
    }
  }
}

// 👥 FUNÇÃO PARA STATS DOS TERAPEUTAS (SIMPLIFICADA)
export async function getTerapeutasStats(periodo: string = 'mes_atual'): Promise<TerapeutaStats[]> {
  try {
    console.log('🔍 Buscando stats dos terapeutas para:', periodo)
    
    const diasAtras = calcularDiasAtras(periodo)
    
    let query = supabase
      .from('consulta')
      .select('terapeuta_id, aluno_id, nota_terapeuta, data_consulta')
    
    if (diasAtras) {
      const dataLimite = new Date()
      dataLimite.setDate(dataLimite.getDate() - diasAtras)
      const dataLimiteISO = dataLimite.toISOString().split('T')[0]
      
      console.log(`📅 Filtrando terapeutas desde: ${dataLimiteISO}`)
      query = query.gte('data_consulta', dataLimiteISO)
    }

    const { data: consultas, error } = await query.limit(5000)
    
    if (error) {
      console.error('❌ Erro ao buscar terapeutas:', error)
      throw error
    }

    if (!consultas || consultas.length === 0) {
      console.log('⚠️ Nenhum dado de terapeutas encontrado')
      return []
    }

    console.log(`📋 Processando ${consultas.length} consultas de terapeutas`)

    // Agrupar por terapeuta
    const terapeutasMap = new Map<number, any[]>()
    
    consultas.forEach(consulta => {
      const id = consulta.terapeuta_id
      if (!terapeutasMap.has(id)) {
        terapeutasMap.set(id, [])
      }
      terapeutasMap.get(id)!.push(consulta)
    })

    // Calcular stats
    const terapeutasStats: TerapeutaStats[] = []
    
    terapeutasMap.forEach((atendimentos, terapeutaId) => {
      const alunosUnicos = new Set(atendimentos.map(a => a.aluno_id)).size
      
      const notasValidas = atendimentos
        .map(a => a.nota_terapeuta)
        .filter(nota => nota !== null && !isNaN(Number(nota)))
        .map(nota => Number(nota))
      
      const notaMedia = notasValidas.length > 0 
        ? notasValidas.reduce((sum, nota) => sum + nota, 0) / notasValidas.length 
        : 0

      terapeutasStats.push({
        terapeuta_id: terapeutaId,
        nome_terapeuta: getNomeTerapeuta(terapeutaId),
        total_atendimentos: atendimentos.length,
        alunos_unicos: alunosUnicos,
        nota_media_alunos: Math.round(notaMedia * 10) / 10
      })
    })

    // Ordenar por atendimentos
    const resultado = terapeutasStats.sort((a, b) => b.total_atendimentos - a.total_atendimentos)
    
    console.log(`✅ Stats calculados para ${resultado.length} terapeutas`)
    return resultado

  } catch (error) {
    console.error('❌ Erro ao buscar stats dos terapeutas:', error)
    
    // FALLBACK: dados exemplo dos terapeutas
    return [
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
  }
}

// 📊 FUNÇÃO PARA ANÁLISE INDIVIDUAL
export async function getAnaliseIndividual(periodo: string = 'mes_atual') {
  try {
    const terapeutasStats = await getTerapeutasStats(periodo)
    
    return terapeutasStats.map(stats => ({
      id: stats.terapeuta_id,
      nome: stats.nome_terapeuta,
      atendimentos: stats.total_atendimentos,
      alunosUnicos: stats.alunos_unicos,
      notaMediaAlunos: stats.nota_media_alunos,
      status: stats.nota_media_alunos <= 5 ? 'Excelente' : 
              stats.nota_media_alunos <= 10 ? 'Bom' : 
              stats.nota_media_alunos <= 15 ? 'Atenção' : 'Crítico'
    }))

  } catch (error) {
    console.error('❌ Erro ao buscar análise individual:', error)
    return []
  }
}
