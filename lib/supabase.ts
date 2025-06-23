// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

// Verificar se as environment variables estão definidas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL não está definida')
  console.log('💡 Verifique se a variável está configurada no Vercel')
  throw new Error('NEXT_PUBLIC_SUPABASE_URL não está definida')
}

if (!supabaseAnonKey) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY não está definida')
  console.log('💡 Verifique se a variável está configurada no Vercel')
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY não está definida')
}

console.log('✅ Environment variables carregadas com sucesso')
console.log('🔗 Supabase URL:', supabaseUrl)
console.log('🔑 Anon Key:', supabaseAnonKey?.substring(0, 20) + '...')

// Criar cliente do Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Para dashboard público
    autoRefreshToken: false
  }
})

// Função para testar a conexão
export async function testarConexao() {
  try {
    console.log('🔍 Testando conexão com Supabase...')
    console.log('URL:', supabaseUrl)
    console.log('Anon Key:', supabaseAnonKey?.substring(0, 20) + '...')
    
    // ⚠️ IMPORTANTE: Substitua 'student_records' pelo nome correto da sua tabela
    const nomeTabela = 'consulta'
    
    // Tentar buscar alguns registros
    const { data, error, count } = await supabase
      .from(nomeTabela)
      .select('*', { count: 'exact' })
      .limit(1)
    
    if (error) {
      console.error('❌ Erro na conexão:', error)
      console.log('💡 Possíveis causas:')
      console.log('   - Nome da tabela incorreto:', nomeTabela)
      console.log('   - Permissões RLS (Row Level Security)')
      console.log('   - Environment variables incorretas')
      throw error
    }
    
    console.log('✅ Conexão bem-sucedida!')
    console.log('📊 Total de registros na tabela:', count)
    console.log('📝 Amostra:', data?.[0])
    
    return { 
      sucesso: true, 
      totalRegistros: count, 
      amostra: data?.[0],
      nomeTabela: nomeTabela
    }
    
  } catch (error) {
    console.error('❌ Falha ao conectar com Supabase:', error)
    return { 
      sucesso: false, 
      erro: error instanceof Error ? error.message : 'Erro desconhecido',
      stack: error instanceof Error ? error.stack : undefined
    }
  }
}

// Função para verificar o nome correto da tabela
export async function listarTabelas() {
  try {
    console.log('🔍 Tentando listar tabelas do esquema public...')
    
    // Método alternativo: tentar nomes comuns de tabela
    const nomesComuns = [
      'student_records',
      'consulta',
      'atendimentos',
      'registros',
      'students',
      'terapeutas',
      'medway_students',
      'records'
    ]
    
    console.log('🔍 Testando nomes comuns de tabela...')
    const tabelasEncontradas = []
    
    for (const nome of nomesComuns) {
      try {
        console.log(`   Testando tabela: ${nome}`)
        const { data, error } = await supabase
          .from(nome)
          .select('*')
          .limit(1)
        
        if (!error && data !== null) {
          console.log(`✅ Tabela encontrada: ${nome}`)
          tabelasEncontradas.push(nome)
        } else if (error) {
          console.log(`❌ ${nome}: ${error.message}`)
        }
      } catch (e) {
        console.log(`❌ ${nome}: erro ao testar`)
      }
    }
    
    return tabelasEncontradas
    
  } catch (error) {
    console.error('❌ Erro ao listar tabelas:', error)
    return []
  }
}

// Função para testar permissões RLS
export async function testarPermissoes() {
  try {
    console.log('🔍 Testando permissões RLS...')
    
    // Testar leitura sem autenticação
    const { data, error } = await supabase
      .from('consulta') // ⚠️ NOME DA TABELA
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Erro de permissão:', error)
      console.log('💡 Possível problema com RLS (Row Level Security)')
      console.log('💡 Verifique as políticas da tabela no Supabase Dashboard')
      return { temPermissao: false, erro: error.message }
    }
    
    console.log('✅ Permissões OK')
    return { temPermissao: true }
    
  } catch (error) {
    console.error('❌ Erro ao testar permissões:', error)
    return { temPermissao: false, erro: error instanceof Error ? error.message : 'Erro desconhecido' }
  }
}

// Types para TypeScript
export interface StudentRecord {
  id: number
  aluno_id: number
  terapeuta_id: number
  nome_completo: string
  data_consulta: string
  nota_terapeuta: number
  nota_total: number
  situacao_mental: string
  atendido: boolean
  // Adicione outros campos conforme necessário baseado na sua tabela
}
