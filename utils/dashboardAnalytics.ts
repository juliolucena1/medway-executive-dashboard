// utils/dashboardAnalytics.ts - VERSÃO CORRIGIDA COMPLETA - SEM LIMITE DE 1000 + BUILD FIX
import { supabase } from '@/lib/supabase'

export interface DashboardMetrics {
  totalAtendimentos: number
  alunosUnicos: number
  notaMediaAlunos: number // Nota dos alunos (0-20, menor é melhor)
  terapeutasAtivos: number
}

export interface TerapeutaStats {
  terapeuta_id: number
  nome_terapeuta: string
  total_atendimentos: number
  alunos_unicos: number
  nota_media_alunos: number // Nota média dos alunos atendidos
}

// 🏷️ MAPEAMENTO DOS NOMES DOS TERAPEUTAS - VERSÃO EXPANDIDA
const NOMES_TERAPEUTAS: Record<number, string> = {
  1: 'Júlio Lucena',
  2: 'Dr. Fernando Silva',
  3: 'Bia Bezerra', 
  4: 'Bia Londres',
  5: 'Davi Belo',
  6: 'Carol Gomes',
  7: 'Dani Matias',
  8: 'Dr. Ricardo Santos',
  9: 'Dra. Patricia Lima',
  10: 'Olga Gomes',
  11: 'Maria Eduarda Costa',
  12: 'Dr. André Oliveira',
  13: 'Dra. Camila Rocha',
  14: 'Dr. Bruno Costa',
  15: 'Dra. Fernanda Alves'
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

// 📅 FUNÇÃO AUXILIAR CORRIGIDA - FILTROS DE DATA FUNCIONANDO
function getDataInicio(periodo: string): { inicio: string | null, fim: string | null } {
  const hoje = new Date()
  console.log('🔍 [Analytics] Calculando período:', periodo, 'Data atual:', hoje.toISOString())
  
  switch (periodo) {
    case 'mes_atual':
      // Primeiro dia do mês atual às 00:00:00
      const inicioMesAtual = new Date(hoje.getFullYear(), hoje.getMonth(), 1, 0, 0, 0, 0)
      console.log('📅 [Analytics] Mês atual - de:', inicioMesAtual.toISOString(), 'até: agora')
      return { 
        inicio: inicioMesAtual.toISOString(),
        fim: null // Até agora
      }
      
    case 'ultimo_mes':
      // Primeiro dia do mês passado às 00:00:00
      const inicioMesPassado = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1, 0, 0, 0, 0)
      // Último dia do mês passado às 23:59:59
      const fimMesPassado = new Date(hoje.getFullYear(), hoje.getMonth(), 0, 23, 59, 59, 999)
      console.log('📅 [Analytics] Último mês - de:', inicioMesPassado.toISOString(), 'até:', fimMesPassado.toISOString())
      return { 
        inicio: inicioMesPassado.toISOString(),
        fim: fimMesPassado.toISOString()
      }
      
    case 'trimestre':
      // Últimos 90 dias
      const inicioTrimestre = new Date(hoje)
      inicioTrimestre.setDate(hoje.getDate() - 90)
      inicioTrimestre.setHours(0, 0, 0, 0)
      console.log('📅 [Analytics] Trimestre - de:', inicioTrimestre.toISOString(), 'até: agora')
      return { 
        inicio: inicioTrimestre.toISOString(),
        fim: null
      }
      
    case 'semestre':
      // Últimos 180 dias
      const inicioSemestre = new Date(hoje)
      inicioSemestre.setDate(hoje.getDate() - 180)
      inicioSemestre.setHours(0, 0, 0, 0)
      console.log('📅 [Analytics] Semestre - de:', inicioSemestre.toISOString(), 'até: agora')
      return { 
        inicio: inicioSemestre.toISOString(),
        fim: null
      }
      
    default:
      console.log('📅 [Analytics] Sem filtro - todos os dados')
      return { inicio: null, fim: null } // Retorna todos os dados
  }
}

// 🔧 FUNÇÃO AUXILIAR - BUSCAR TODOS OS DADOS SEM LIMITE
async function buscarTodosOsDados(query: any, nomeConsulta: string = 'dados'): Promise<any[]> {
  console.log(`📡 [Analytics] Iniciando busca completa de ${nomeConsulta}...`)
  
  let allData: any[] = []
  let from = 0
  const batchSize = 1000 // Tamanho do lote
  let hasMore = true
  let batchCount = 0

  while (hasMore) {
    try {
      batchCount++
      console.log(`📦 [Analytics] Buscando lote ${batchCount} de ${nomeConsulta} (${from}-${from + batchSize - 1})...`)
      
      const { data: batch, error } = await query
        .range(from, from + batchSize - 1)
        .abortSignal(AbortSignal.timeout(45000)) // 45s timeout por lote
      
      if (error) {
        console.error(`❌ [Analytics] Erro no lote ${batchCount}:`, error)
        throw new Error(`Erro Supabase (lote ${batchCount}): ${error.message}`)
      }

      if (batch && batch.length > 0) {
        allData = [...allData, ...batch]
        console.log(`✅ [Analytics] Lote ${batchCount}: ${batch.length} registros | Total acumulado: ${allData.length}`)
        
        // Se o lote retornou menos que o tamanho máximo, chegamos ao fim
        if (batch.length < batchSize) {
          hasMore = false
          console.log(`🏁 [Analytics] Fim dos dados - último lote com ${batch.length} registros`)
        } else {
          from += batchSize
        }
      } else {
        hasMore = false
        console.log(`🏁 [Analytics] Nenhum dado no lote ${batchCount} - fim da busca`)
      }
      
      // 🔧 CORREÇÃO CRÍTICA: Sem limite máximo de tentativas para pegar TODOS os dados
      if (batchCount >= 100) { // Proteção contra loop infinito (100 lotes = 100.000 registros)
        console.warn(`⚠️ [Analytics] Limite de segurança atingido: ${batchCount} lotes (${allData.length} registros)`)
        break
      }
      
    } catch (batchError: any) {
      console.error(`❌ [Analytics] Erro no lote ${batchCount}:`, batchError)
      if (batchError.name === 'AbortError') {
        throw new Error(`Timeout no lote ${batchCount} - dados parciais: ${allData.length} registros`)
      }
      throw batchError
    }
  }

  console.log(`🎯 [Analytics] Busca de ${nomeConsulta} concluída: ${allData.length} registros em ${batchCount} lotes`)
  return allData
}

// 🔧 FUNÇÃO PRINCIPAL CORRIGIDA - MÉTRICAS DO DASHBOARD
export async function getDashboardMetrics(periodo: string = 'mes_atual'): Promise<DashboardMetrics> {
  try {
    console.log('🔍 [Analytics] Iniciando busca de métricas para período:', periodo)
    
    // Calcular datas corretamente
    const { inicio, fim } = getDataInicio(periodo)
    
    // Query base mais robusta
    let query = supabase
      .from('consulta')
      .select('*')
      .order('data_consulta', { ascending: false })
    
    // Aplicar filtros de data corretamente
    if (inicio) {
      query = query.gte('data_consulta', inicio)
      console.log('📅 [Analytics] Filtro aplicado - início:', inicio)
    }
    
    if (fim) {
      query = query.lte('data_consulta', fim)
      console.log('📅 [Analytics] Filtro aplicado - fim:', fim)
    }

    // 🔧 CORREÇÃO CRÍTICA: Buscar TODOS os dados sem limite
    const consultas = await buscarTodosOsDados(query, `métricas-${periodo}`)

    if (!consultas || consultas.length === 0) {
      console.log('⚠️ [Analytics] Nenhum dado encontrado para o período', periodo)
      return {
        totalAtendimentos: 0,
        alunosUnicos: 0,
        notaMediaAlunos: 0,
        terapeutasAtivos: 0
      }
    }

    // Log detalhado dos dados encontrados
    console.log('✅ [Analytics] Dados carregados:', {
      totalRegistros: consultas.length,
      primeiroRegistro: consultas[consultas.length - 1]?.data_consulta,
      ultimoRegistro: consultas[0]?.data_consulta,
      periodo: periodo
    })

    // 1. Total de Atendimentos
    const totalAtendimentos = consultas.length

    // 2. Alunos Únicos
    const alunosUnicosSet = new Set(consultas.map(c => c.aluno_id).filter(id => id !== null))
    const alunosUnicos = alunosUnicosSet.size

    // 3. Nota Média dos Alunos (calculada corretamente)
    const notasValidas = consultas
      .map(c => c.nota_terapeuta)
      .filter(nota => nota !== null && nota !== undefined && !isNaN(Number(nota)) && Number(nota) >= 0)
    
    const notaMediaAlunos = notasValidas.length > 0 
      ? notasValidas.reduce((sum, nota) => sum + Number(nota), 0) / notasValidas.length 
      : 0

    // 4. Terapeutas Ativos
    const terapeutasAtivosSet = new Set(consultas.map(c => c.terapeuta_id).filter(id => id !== null))
    const terapeutasAtivos = terapeutasAtivosSet.size

    const metricas = {
      totalAtendimentos,
      alunosUnicos,
      notaMediaAlunos: Math.round(notaMediaAlunos * 10) / 10,
      terapeutasAtivos
    }

    console.log('📊 [Analytics] Métricas calculadas:', metricas)
    
    // Validação adicional
    if (metricas.totalAtendimentos === 0) {
      console.log('⚠️ [Analytics] Nenhum atendimento encontrado - verificar filtros de data')
    } else if (metricas.totalAtendimentos < 1000) {
      console.log('⚠️ [Analytics] Poucos atendimentos encontrados - dados podem estar filtrados')
    }
    
    return metricas

  } catch (error: any) {
    console.error('❌ [Analytics] Erro crítico ao calcular métricas:', {
      message: error.message,
      stack: error.stack,
      periodo: periodo
    })
    
    throw new Error(`Falha ao carregar métricas: ${error.message}`)
  }
}

// 🔧 FUNÇÃO CORRIGIDA - ESTATÍSTICAS POR TERAPEUTA
export async function getTerapeutasStats(periodo: string = 'mes_atual'): Promise<TerapeutaStats[]> {
  try {
    console.log('🔍 [Analytics] Buscando stats dos terapeutas para período:', periodo)
    
    const { inicio, fim } = getDataInicio(periodo)
    
    let query = supabase
      .from('consulta')
      .select('terapeuta_id, aluno_id, nota_terapeuta, data_consulta')
      .order('data_consulta', { ascending: false })
    
    // Aplicar filtros de data
    if (inicio) {
      query = query.gte('data_consulta', inicio)
    }
    if (fim) {
      query = query.lte('data_consulta', fim)
    }

    // 🔧 CORREÇÃO CRÍTICA: Buscar TODOS os dados dos terapeutas
    const consultas = await buscarTodosOsDados(query, `terapeutas-${periodo}`)
    
    if (!consultas || consultas.length === 0) {
      console.log('⚠️ [Analytics] Nenhum dado de terapeuta encontrado')
      return []
    }

    console.log('📊 [Analytics] Processando', consultas.length, 'consultas para stats dos terapeutas')

    // Agrupar e calcular estatísticas de forma robusta
    const terapeutasMap = new Map<number, any[]>()
    
    consultas.forEach(consulta => {
      const terapeutaId = consulta.terapeuta_id
      if (terapeutaId !== null && terapeutaId !== undefined) {
        if (!terapeutasMap.has(terapeutaId)) {
          terapeutasMap.set(terapeutaId, [])
        }
        terapeutasMap.get(terapeutaId)!.push(consulta)
      }
    })

    // Calcular estatísticas para cada terapeuta
    const terapeutasStats: TerapeutaStats[] = []
    
    terapeutasMap.forEach((atendimentos, terapeutaId) => {
      const alunosUnicosSet = new Set(
        atendimentos
          .map(a => a.aluno_id)
          .filter(id => id !== null && id !== undefined)
      )
      
      const notasValidas = atendimentos
        .map(a => a.nota_terapeuta)
        .filter(nota => nota !== null && !isNaN(Number(nota)) && Number(nota) >= 0)
      
      const notaMediaAlunos = notasValidas.length > 0 
        ? notasValidas.reduce((sum, nota) => sum + Number(nota), 0) / notasValidas.length 
        : 0

      // Só incluir terapeutas com dados válidos
      if (atendimentos.length > 0) {
        terapeutasStats.push({
          terapeuta_id: terapeutaId,
          nome_terapeuta: getNomeTerapeuta(terapeutaId),
          total_atendimentos: atendimentos.length,
          alunos_unicos: alunosUnicosSet.size,
          nota_media_alunos: Math.round(notaMediaAlunos * 10) / 10
        })
      }
    })

    // Ordenar por total de atendimentos (decrescente)
    const statsOrdenados = terapeutasStats.sort((a, b) => b.total_atendimentos - a.total_atendimentos)
    
    console.log('📋 [Analytics] Stats calculados para', statsOrdenados.length, 'terapeutas:', 
      statsOrdenados.map(t => ({ 
        id: t.terapeuta_id,
        nome: t.nome_terapeuta, 
        atendimentos: t.total_atendimentos 
      })))
    
    return statsOrdenados

  } catch (error: any) {
    console.error('❌ [Analytics] Erro crítico ao buscar stats dos terapeutas:', {
      message: error.message,
      stack: error.stack,
      periodo: periodo
    })
    
    throw new Error(`Falha ao carregar dados dos terapeutas: ${error.message}`)
  }
}

// 🔧 FUNÇÃO DE ANÁLISE INDIVIDUAL CORRIGIDA
export async function getAnaliseIndividual(periodo: string = 'mes_atual') {
  try {
    console.log('🔍 [Analytics] Buscando análise individual para período:', periodo)
    
    const terapeutasStats = await getTerapeutasStats(periodo)
    
    const analise = terapeutasStats.map(stats => ({
      id: stats.terapeuta_id,
      nome: stats.nome_terapeuta,
      atendimentos: stats.total_atendimentos,
      alunosUnicos: stats.alunos_unicos,
      notaMediaAlunos: stats.nota_media_alunos,
      interpretacao: interpretarNotaAluno(stats.nota_media_alunos)
    }))

    console.log('📊 [Analytics] Análise individual gerada para', analise.length, 'terapeutas')
    return analise

  } catch (error: any) {
    console.error('❌ [Analytics] Erro ao buscar análise individual:', error)
    throw new Error(`Falha na análise individual: ${error.message}`)
  }
}

// 🔧 FUNÇÃO DE DEBUG CORRIGIDA - SEM SPREAD OPERATOR EM SET
export async function debugFiltros(): Promise<any> {
  try {
    console.log('🐛 [Debug] Testando todos os filtros...')
    
    const resultados = {
      mesAtual: await getDashboardMetrics('mes_atual'),
      ultimoMes: await getDashboardMetrics('ultimo_mes'),
      trimestre: await getDashboardMetrics('trimestre'),
      semestre: await getDashboardMetrics('semestre')
    }
    
    console.log('🐛 [Debug] Resultados:', resultados)
    
    // 🔧 CORREÇÃO DO BUILD ERROR: Usar Array.from em vez de spread operator
    const numeros = [
      resultados.mesAtual.totalAtendimentos,
      resultados.ultimoMes.totalAtendimentos,
      resultados.trimestre.totalAtendimentos,
      resultados.semestre.totalAtendimentos
    ]
    
    const numerosUnicos = Array.from(new Set(numeros)) // ✅ CORRIGIDO: Array.from em vez de spread
    const filtrosFuncionando = numerosUnicos.length > 1
    
    console.log('🐛 [Debug] Filtros funcionando:', filtrosFuncionando)
    console.log('🐛 [Debug] Números únicos encontrados:', numerosUnicos)
    
    return {
      ...resultados,
      filtrosFuncionando,
      numerosUnicos: numerosUnicos.length,
      numerosDetalhados: numerosUnicos,
      timestamp: new Date().toISOString()
    }
    
  } catch (error: any) {
    console.error('❌ [Debug] Erro no debug:', error)
    throw error
  }
}

// 🔧 FUNÇÃO AUXILIAR PARA VERIFICAR DADOS COMPLETOS
export async function verificarDadosCompletos(): Promise<any> {
  try {
    console.log('🔍 [Verificação] Testando busca completa de dados...')
    
    // Buscar dados sem filtro para ver o total real
    const query = supabase
      .from('consulta')
      .select('terapeuta_id, aluno_id, data_consulta')
      .order('data_consulta', { ascending: false })
    
    const todosOsDados = await buscarTodosOsDados(query, 'verificação-completa')
    
    // Estatísticas gerais
    const terapeutasUnicos = Array.from(new Set(todosOsDados.map(d => d.terapeuta_id).filter(id => id !== null)))
    const alunosUnicos = Array.from(new Set(todosOsDados.map(d => d.aluno_id).filter(id => id !== null)))
    
    const verificacao = {
      totalRegistros: todosOsDados.length,
      terapeutasUnicos: terapeutasUnicos.length,
      alunosUnicos: alunosUnicos.length,
      terapeutasIds: terapeutasUnicos.sort((a, b) => a - b),
      primeiroRegistro: todosOsDados[todosOsDados.length - 1]?.data_consulta,
      ultimoRegistro: todosOsDados[0]?.data_consulta
    }
    
    console.log('✅ [Verificação] Dados completos:', verificacao)
    return verificacao
    
  } catch (error: any) {
    console.error('❌ [Verificação] Erro:', error)
    throw error
  }
}
