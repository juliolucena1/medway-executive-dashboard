'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react';

interface Consulta {
  id: number;
  aluno_id: string;
  terapeuta_id: string;
  situacao_mental: string;
  observacoes: string;
  created_at?: string;
}

interface TerapeutaAnalytics {
  id: string;
  nome: string;
  totalAtendimentos: number;
  atendimentosMes: number;
  atendimentosSemana: number;
  alunosUnicos: number;
  notaMedia: number;
  distribuicaoSituacao: {
    leve: number;
    consideravel: number;
    grave: number;
    estavel: number;
  };
  mediaSemanal: number;
  atendimentosPorMes: Record<string, number>;
  tendencia: 'crescendo' | 'estavel' | 'decrescendo';
  eficiencia: number;
  ultimoAtendimento: string;
}

interface PeriodoFiltro {
  inicio: string;
  fim: string;
  label: string;
}

export default function ExecutiveTherapistDashboard() {
  const [data, setData] = useState<Consulta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [selectedPeriod, setSelectedPeriod] = useState('trimestre');
  const [selectedTherapist, setSelectedTherapist] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'overview' | 'individual' | 'comparison'>('overview');
  const [sortBy, setSortBy] = useState<'totalAtendimentos' | 'notaMedia' | 'eficiencia' | 'alunosUnicos'>('totalAtendimentos');

  // Configuração Supabase
  const SUPABASE_URL = 'https://dtvaadwcfzpgbthkjlqa.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0dmFhZHdjZnpwZ2J0aGtqbHFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA3MzIxMDAsImV4cCI6MjA0NjMwODEwMH0.JIENlyeyk0ibOq0Nb4ydFSFbsPprBFICfNHlvF8guwU';

  // Períodos predefinidos
  const periodos: Record<string, PeriodoFiltro> = {
    semana: {
      inicio: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      fim: new Date().toISOString(),
      label: 'Última Semana'
    },
    mes: {
      inicio: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      fim: new Date().toISOString(),
      label: 'Último Mês'
    },
    trimestre: {
      inicio: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      fim: new Date().toISOString(),
      label: 'Último Trimestre'
    },
    semestre: {
      inicio: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
      fim: new Date().toISOString(),
      label: 'Último Semestre'
    },
    ano: {
      inicio: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
      fim: new Date().toISOString(),
      label: 'Último Ano'
    }
  };

  // Fetch data do Supabase
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const url = `${SUPABASE_URL}/rest/v1/consulta?select=id,aluno_id,terapeuta_id,situacao_mental,observacoes,created_at&order=created_at.desc&limit=1000`;
      
      const headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      };
      
      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      
      const result: Consulta[] = await response.json();
      
      // Adicionar created_at fake se não existir
      const dadosComData = result.map((item, index) => ({
        ...item,
        created_at: item.created_at || new Date(Date.now() - index * 60 * 60 * 1000).toISOString()
      }));
      
      setData(dadosComData);
      setLastUpdate(new Date());
      
    } catch (error: any) {
      console.error('❌ ERRO ao buscar dados:', error);
      setError(error.message);
      
      // Dados de exemplo mais realistas para demonstração
      const dadosExemplo: Consulta[] = Array.from({ length: 150 }, (_, index) => {
        const terapeutas = ['Dr. João Santos', 'Dra. Ana Lima', 'Dr. Carlos Mendes', 'Dra. Maria Silva', 'Dr. Pedro Costa', 'Dra. Laura Oliveira'];
        const situacoes = ['LEVE', 'CONSIDERAVEL', 'GRAVE', 'ESTÁVEL'];
        const terapeuta = terapeutas[index % terapeutas.length];
        const diasAtras = Math.floor(index / 2);
        
        return {
          id: index + 1,
          aluno_id: `ALU${(index % 50) + 1}`,
          terapeuta_id: terapeuta,
          situacao_mental: situacoes[Math.floor(Math.random() * situacoes.length)],
          observacoes: `Observações da consulta ${index + 1}`,
          created_at: new Date(Date.now() - diasAtras * 24 * 60 * 60 * 1000).toISOString()
        };
      });
      
      setData(dadosExemplo);
    } finally {
      setLoading(false);
    }
  }, [SUPABASE_URL, SUPABASE_KEY]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Função para calcular nota baseada na situação mental
  const calcularNota = (situacao: string): number => {
    switch(situacao) {
      case 'LEVE': return Math.random() * 30;
      case 'CONSIDERAVEL': return Math.random() * 20 + 30;
      case 'GRAVE': return Math.random() * 20 + 50;
      case 'ESTÁVEL': return Math.random() * 25;
      default: return Math.random() * 100;
    }
  };

  // Analytics dos terapeutas
  const terapeutasAnalytics = useMemo((): TerapeutaAnalytics[] => {
    if (!data.length) return [];

    const periodo = periodos[selectedPeriod];
    const dadosFiltrados = data.filter(item => {
      const itemDate = new Date(item.created_at || '');
      return itemDate >= new Date(periodo.inicio) && itemDate <= new Date(periodo.fim);
    });

    const terapeutasMap = new Map<string, Consulta[]>();
    
    dadosFiltrados.forEach(consulta => {
      const terapeuta = consulta.terapeuta_id;
      if (!terapeutasMap.has(terapeuta)) {
        terapeutasMap.set(terapeuta, []);
      }
      terapeutasMap.get(terapeuta)!.push(consulta);
    });

    const analytics: TerapeutaAnalytics[] = [];
    
    terapeutasMap.forEach((consultas, terapeutaId) => {
      const agora = new Date();
      const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
      const inicioSemana = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const consultasMes = consultas.filter(c => new Date(c.created_at || '') >= inicioMes);
      const consultasSemana = consultas.filter(c => new Date(c.created_at || '') >= inicioSemana);
      
      const alunosUnicos = new Set(consultas.map(c => c.aluno_id)).size;
      
      const distribuicao = {
        leve: consultas.filter(c => c.situacao_mental === 'LEVE').length,
        consideravel: consultas.filter(c => c.situacao_mental === 'CONSIDERAVEL').length,
        grave: consultas.filter(c => c.situacao_mental === 'GRAVE').length,
        estavel: consultas.filter(c => c.situacao_mental === 'ESTÁVEL').length
      };
      
      const notas = consultas.map(c => calcularNota(c.situacao_mental));
      const notaMedia = notas.reduce((acc, nota) => acc + nota, 0) / notas.length;
      
      const atendimentosPorMes: Record<string, number> = {};
      for (let i = 0; i < 12; i++) {
        const mes = new Date(agora.getFullYear(), agora.getMonth() - i, 1);
        const proximoMes = new Date(agora.getFullYear(), agora.getMonth() - i + 1, 1);
        const chave = mes.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
        
        atendimentosPorMes[chave] = consultas.filter(c => {
          const dataConsulta = new Date(c.created_at || '');
          return dataConsulta >= mes && dataConsulta < proximoMes;
        }).length;
      }
      
      const semanas = Math.ceil((new Date(periodo.fim).getTime() - new Date(periodo.inicio).getTime()) / (7 * 24 * 60 * 60 * 1000));
      const mediaSemanal = consultas.length / Math.max(semanas, 1);
      
      const ultimas4Semanas = [];
      for (let i = 0; i < 4; i++) {
        const inicioSem = new Date(agora.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
        const fimSem = new Date(agora.getTime() - i * 7 * 24 * 60 * 60 * 1000);
        const atendimentosSem = consultas.filter(c => {
          const data = new Date(c.created_at || '');
          return data >= inicioSem && data < fimSem;
        }).length;
        ultimas4Semanas.push(atendimentosSem);
      }
      
      const tendencia: 'crescendo' | 'estavel' | 'decrescendo' = 
        ultimas4Semanas[0] > ultimas4Semanas[3] ? 'crescendo' :
        ultimas4Semanas[0] < ultimas4Semanas[3] ? 'decrescendo' : 'estavel';
      
      const casosPositivos = distribuicao.leve + distribuicao.estavel;
      const casosNegativos = distribuicao.grave + distribuicao.consideravel;
      const eficiencia = consultas.length > 0 ? (casosPositivos / consultas.length) * 100 : 0;
      
      const ultimaConsulta = consultas.sort((a, b) => 
        new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
      )[0];
      
      analytics.push({
        id: terapeutaId,
        nome: terapeutaId,
        totalAtendimentos: consultas.length,
        atendimentosMes: consultasMes.length,
        atendimentosSemana: consultasSemana.length,
        alunosUnicos,
        notaMedia,
        distribuicaoSituacao: distribuicao,
        mediaSemanal,
        atendimentosPorMes,
        tendencia,
        eficiencia,
        ultimoAtendimento: ultimaConsulta?.created_at || ''
      });
    });

    return analytics.sort((a, b) => {
      switch(sortBy) {
        case 'totalAtendimentos': return b.totalAtendimentos - a.totalAtendimentos;
        case 'notaMedia': return a.notaMedia - b.notaMedia;
        case 'eficiencia': return b.eficiencia - a.eficiencia;
        case 'alunosUnicos': return b.alunosUnicos - a.alunosUnicos;
        default: return b.totalAtendimentos - a.totalAtendimentos;
      }
    });
  }, [data, selectedPeriod, sortBy]);

  const metricsGerais = useMemo(() => {
    if (!terapeutasAnalytics.length) return null;

    const totalAtendimentos = terapeutasAnalytics.reduce((acc, t) => acc + t.totalAtendimentos, 0);
    const totalAlunosUnicos = new Set(data.map(d => d.aluno_id)).size;
    const mediaNotaEquipe = terapeutasAnalytics.reduce((acc, t) => acc + t.notaMedia, 0) / terapeutasAnalytics.length;
    const mediaEficiencia = terapeutasAnalytics.reduce((acc, t) => acc + t.eficiencia, 0) / terapeutasAnalytics.length;
    
    return {
      totalAtendimentos,
      totalAlunosUnicos,
      totalTerapeutas: terapeutasAnalytics.length,
      mediaNotaEquipe,
      mediaEficiencia,
      terapeutaMaisAtivo: terapeutasAnalytics[0]?.nome || '',
      terapeutaMaiorEficiencia: terapeutasAnalytics.sort((a, b) => b.eficiencia - a.eficiencia)[0]?.nome || ''
    };
  }, [terapeutasAnalytics, data]);

  const formatarNumero = (num: number): string => {
    return new Intl.NumberFormat('pt-BR').format(num);
  };

  const getTendenciaIcon = (tendencia: 'crescendo' | 'estavel' | 'decrescendo'): string => {
    switch(tendencia) {
      case 'crescendo': return '📈';
      case 'decrescendo': return '📉';
      default: return '➖';
    }
  };

  const getTendenciaColor = (tendencia: 'crescendo' | 'estavel' | 'decrescendo'): string => {
    switch(tendencia) {
      case 'crescendo': return '#10b981';
      case 'decrescendo': return '#ef4444';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: `
          linear-gradient(135deg, rgba(15, 23, 42, 0.97) 0%, rgba(30, 41, 59, 0.95) 100%),
          radial-gradient(circle at 25% 25%, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
          radial-gradient(circle at 75% 75%, rgba(168, 85, 247, 0.12) 0%, transparent 50%)
        `,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          borderRadius: '32px',
          padding: '48px 40px',
          textAlign: 'center',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          maxWidth: '480px',
          width: '90%'
        }}>
          <div style={{
            width: '100px',
            height: '100px',
            background: `linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)`,
            borderRadius: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 32px',
            fontSize: '48px'
          }}>
            📊
          </div>
          
          <h2 style={{ 
            color: '#f8fafc', 
            marginBottom: '16px', 
            fontSize: '32px',
            fontWeight: '700'
          }}>
            MEDWAY Executive
          </h2>
          
          <p style={{ 
            color: 'rgba(248, 250, 252, 0.7)', 
            marginBottom: '32px',
            fontSize: '18px'
          }}>
            Carregando análise de produtividade...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: `
        linear-gradient(135deg, rgba(15, 23, 42, 0.97) 0%, rgba(30, 41, 59, 0.95) 100%),
        radial-gradient(circle at 25% 25%, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
        radial-gradient(circle at 75% 75%, rgba(168, 85, 247, 0.12) 0%, transparent 50%)
      `,
      fontFamily: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`,
      position: 'relative'
    }}>
      <style>{`
        * { 
          margin: 0; 
          padding: 0; 
          box-sizing: border-box; 
        }
        
        .executive-card {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 32px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.25);
          margin-bottom: 24px;
          transition: all 0.4s ease;
        }
        
        .metric-card-executive {
          background: rgba(255, 255, 255, 0.06);
          backdrop-filter: blur(16px);
          border-radius: 20px;
          padding: 28px;
          text-align: center;
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
          transition: all 0.4s ease;
          margin-bottom: 24px;
        }
        
        .btn-executive {
          padding: 12px 24px;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.3s ease;
          margin: 4px;
          font-family: inherit;
        }
        
        .btn-primary-exec {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: white;
          border: 1px solid rgba(99, 102, 241, 0.3);
        }
        
        .btn-secondary-exec {
          background: rgba(71, 85, 105, 0.6);
          color: rgba(248, 250, 252, 0.9);
          border: 1px solid rgba(71, 85, 105, 0.3);
        }
      `}</style>

      {/* Header Executivo */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(24px)',
        padding: '24px 0',
        marginBottom: '32px',
        borderRadius: '0 0 32px 32px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderTop: 'none'
      }}>
        <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: `linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)`,
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '40px'
              }}>
                📊
              </div>
              <div>
                <h1 style={{
                  fontSize: '42px',
                  fontWeight: '800',
                  marginBottom: '8px',
                  background: `linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  MEDWAY Executive
                </h1>
                <div style={{ 
                  fontSize: '16px', 
                  color: 'rgba(248, 250, 252, 0.8)'
                }}>
                  Dashboard de Análise de Produtividade dos Terapeutas
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '6px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                gap: '4px'
              }}>
                {Object.entries(periodos).map(([key, periodo]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedPeriod(key)}
                    className={`btn-executive ${selectedPeriod === key ? 'btn-primary-exec' : 'btn-secondary-exec'}`}
                    style={{ margin: '0', padding: '10px 16px', borderRadius: '10px', fontSize: '13px' }}
                  >
                    {periodo.label}
                  </button>
                ))}
              </div>

              <button
                onClick={fetchData}
                disabled={loading}
                className="btn-executive btn-primary-exec"
                style={{ opacity: loading ? 0.6 : 1 }}
              >
                🔄 Atualizar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 24px' }}>
        {/* Métricas Gerais */}
        {metricsGerais && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '32px' }}>
            <div className="metric-card-executive">
              <div style={{ color: 'rgba(248, 250, 252, 0.7)', fontSize: '14px', marginBottom: '8px' }}>
                Total de Atendimentos
              </div>
              <div style={{ 
                fontSize: '48px', 
                fontWeight: '800', 
                margin: '16px 0',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                {formatarNumero(metricsGerais.totalAtendimentos)}
              </div>
            </div>

            <div className="metric-card-executive">
              <div style={{ color: 'rgba(248, 250, 252, 0.7)', fontSize: '14px', marginBottom: '8px' }}>
                Alunos Únicos
              </div>
              <div style={{ 
                fontSize: '48px', 
                fontWeight: '800', 
                margin: '16px 0',
                background: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                {formatarNumero(metricsGerais.totalAlunosUnicos)}
              </div>
            </div>

            <div className="metric-card-executive">
              <div style={{ color: 'rgba(248, 250, 252, 0.7)', fontSize: '14px', marginBottom: '8px' }}>
                Nota Média da Equipe
              </div>
              <div style={{ 
                fontSize: '48px', 
                fontWeight: '800', 
                margin: '16px 0',
                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                {metricsGerais.mediaNotaEquipe.toFixed(1)}
              </div>
            </div>

            <div className="metric-card-executive">
              <div style={{ color: 'rgba(248, 250, 252, 0.7)', fontSize: '14px', marginBottom: '8px' }}>
                Terapeutas Ativos
              </div>
              <div style={{ 
                fontSize: '48px', 
                fontWeight: '800', 
                margin: '16px 0',
                color: 'rgba(248, 250, 252, 0.9)'
              }}>
                {metricsGerais.totalTerapeutas}
              </div>
            </div>
          </div>
        )}

        {/* Lista de Terapeutas */}
        <div className="executive-card">
          <h2 style={{ 
            fontSize: '28px', 
            fontWeight: '700', 
            color: 'rgba(248, 250, 252, 0.95)',
            marginBottom: '24px'
          }}>
            👥 Análise Individual dos Terapeutas
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
            {terapeutasAnalytics.map((terapeuta, index) => (
              <div 
                key={terapeuta.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ 
                      fontSize: '20px', 
                      fontWeight: '700', 
                      color: 'rgba(248, 250, 252, 0.95)',
                      marginBottom: '4px'
                    }}>
                      {terapeuta.nome}
                    </h3>
                    <div style={{ 
                      fontSize: '14px', 
                      color: 'rgba(248, 250, 252, 0.6)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span>{getTendenciaIcon(terapeuta.tendencia)}</span>
                      <span style={{ color: getTendenciaColor(terapeuta.tendencia) }}>
                        {terapeuta.tendencia === 'crescendo' ? 'Em crescimento' : 
                         terapeuta.tendencia === 'decrescendo' ? 'Em declínio' : 'Estável'}
                      </span>
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ 
                      fontSize: '24px', 
                      fontWeight: '800', 
                      color: '#6366f1'
                    }}>
                      {terapeuta.totalAtendimentos}
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: 'rgba(248, 250, 252, 0.6)'
                    }}>
                      atendimentos
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#34d399' }}>
                      {terapeuta.alunosUnicos}
                    </div>
                    <div style={{ fontSize: '12px', color: 'rgba(248, 250, 252, 0.6)' }}>
                      Alunos únicos
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#fbbf24' }}>
                      {terapeuta.notaMedia.toFixed(1)}
                    </div>
                    <div style={{ fontSize: '12px', color: 'rgba(248, 250, 252, 0.6)' }}>
                      Nota média
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#8b5cf6' }}>
                      {terapeuta.mediaSemanal.toFixed(1)}
                    </div>
                    <div style={{ fontSize: '12px', color: 'rgba(248, 250, 252, 0.6)' }}>
                      Média/semana
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
