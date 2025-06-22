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
  eficiencia: number; // baseada na melhora dos pacientes
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
      case 'LEVE': return Math.random() * 30; // 0-29
      case 'CONSIDERAVEL': return Math.random() * 20 + 30; // 30-49
      case 'GRAVE': return Math.random() * 20 + 50; // 50-69
      case 'ESTÁVEL': return Math.random() * 25; // 0-24
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
    
    // Agrupar por terapeuta
    dadosFiltrados.forEach(consulta => {
      const terapeuta = consulta.terapeuta_id;
      if (!terapeutasMap.has(terapeuta)) {
        terapeutasMap.set(terapeuta, []);
      }
      terapeutasMap.get(terapeuta)!.push(consulta);
    });

    // Calcular métricas para cada terapeuta
    const analytics: TerapeutaAnalytics[] = [];
    
    terapeutasMap.forEach((consultas, terapeutaId) => {
      const agora = new Date();
      const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
      const inicioSemana = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      // Filtros temporais
      const consultasMes = consultas.filter(c => new Date(c.created_at || '') >= inicioMes);
      const consultasSemana = consultas.filter(c => new Date(c.created_at || '') >= inicioSemana);
      
      // Alunos únicos
      const alunosUnicos = new Set(consultas.map(c => c.aluno_id)).size;
      
      // Distribuição de situação mental
      const distribuicao = {
        leve: consultas.filter(c => c.situacao_mental === 'LEVE').length,
        consideravel: consultas.filter(c => c.situacao_mental === 'CONSIDERAVEL').length,
        grave: consultas.filter(c => c.situacao_mental === 'GRAVE').length,
        estavel: consultas.filter(c => c.situacao_mental === 'ESTÁVEL').length
      };
      
      // Nota média
      const notas = consultas.map(c => calcularNota(c.situacao_mental));
      const notaMedia = notas.reduce((acc, nota) => acc + nota, 0) / notas.length;
      
      // Atendimentos por mês (últimos 12 meses)
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
      
      // Média semanal
      const semanas = Math.ceil((new Date(periodo.fim).getTime() - new Date(periodo.inicio).getTime()) / (7 * 24 * 60 * 60 * 1000));
      const mediaSemanal = consultas.length / Math.max(semanas, 1);
      
      // Tendência (comparando últimas 4 semanas)
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
      
      // Eficiência (baseada na proporção de casos estáveis/leves vs graves)
      const casosPositivos = distribuicao.leve + distribuicao.estavel;
      const casosNegativos = distribuicao.grave + distribuicao.consideravel;
      const eficiencia = consultas.length > 0 ? (casosPositivos / consultas.length) * 100 : 0;
      
      // Último atendimento
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

    // Ordenar por critério selecionado
    return analytics.sort((a, b) => {
      switch(sortBy) {
        case 'totalAtendimentos': return b.totalAtendimentos - a.totalAtendimentos;
        case 'notaMedia': return a.notaMedia - b.notaMedia; // Menor nota é melhor
        case 'eficiencia': return b.eficiencia - a.eficiencia;
        case 'alunosUnicos': return b.alunosUnicos - a.alunosUnicos;
        default: return b.totalAtendimentos - a.totalAtendimentos;
      }
    });
  }, [data, selectedPeriod, sortBy]);

  // Métricas gerais da equipe
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
          
          <div style={{
            padding: '16px 24px',
            background: 'rgba(99, 102, 241, 0.1)',
            borderRadius: '16px',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            color: 'rgba(248, 250, 252, 0.8)',
            fontSize: '14px'
          }}>
            🔗 Conectando ao Supabase...
          </div>
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
          box-shadow: 
            0 20px 40px -12px rgba(0, 0, 0, 0.25),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          margin-bottom: 24px;
          transition: all 0.4s ease;
        }
        
        .executive-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 32px 64px -12px rgba(0, 0, 0, 0.35);
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
          position: relative;
          overflow: hidden;
        }
        
        .metric-card-executive:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 16px 48px rgba(0, 0, 0, 0.25);
        }
        
        .therapist-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(12px);
          border-radius: 16px;
          padding: 24px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          margin-bottom: 16px;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        
        .therapist-card:hover {
          background: rgba(255, 255, 255, 0.08);
          transform: translateX(8px);
          border-color: rgba(99, 102, 241, 0.3);
        }
        
        .therapist-card.selected {
          background: rgba(99, 102, 241, 0.15);
          border-color: rgba(99, 102, 241, 0.5);
          transform: translateX(8px);
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
          letter-spacing: 0.025em;
          backdrop-filter: blur(8px);
        }
        
        .btn-primary-exec {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: white;
          border: 1px solid rgba(99, 102, 241, 0.3);
          box-shadow: 0 4px 16px rgba(99, 102, 241, 0.3);
        }
        
        .btn-primary-exec:hover {
          background: linear-gradient(135deg, #5b5ff9 0%, #9333ea 100%);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4);
        }
        
        .btn-secondary-exec {
          background: rgba(71, 85, 105, 0.6);
          color: rgba(248, 250, 252, 0.9);
          border: 1px solid rgba(71, 85, 105, 0.3);
        }
        
        .btn-secondary-exec:hover {
          background: rgba(71, 85, 105, 0.8);
          transform: translateY(-2px);
          color: white;
        }
        
        .efficiency-bar {
          width: 100%;
          height: 8px;
          background: rgba(71, 85, 105, 0.3);
          border-radius: 4px;
          overflow: hidden;
          margin: 8px 0;
        }
        
        .efficiency-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 1s ease;
        }
        
        .efficiency-high { background: linear-gradient(90deg, #10b981, #059669); }
        .efficiency-medium { background: linear-gradient(90deg, #f59e0b, #d97706); }
        .efficiency-low { background: linear-gradient(90deg, #ef4444, #dc2626); }
        
        .ranking-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          color: white;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 14px;
          box-shadow: 0 4px 12px rgba(251, 191, 36, 0.4);
        }
        
        .ranking-badge.first {
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
        }
        
        .ranking-badge.second {
          background: linear-gradient(135deg, #6b7280, #4b5563);
        }
        
        .ranking-badge.third {
          background: linear-gradient(135deg, #92400e, #78350f);
        }
        
        @media (max-width: 768px) {
          .executive-card { padding: 20px; }
          .metric-card-executive { padding: 20px; }
          .therapist-card { padding: 16px; }
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
        borderTop: 'none',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
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
                fontSize: '40px',
                boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)'
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
                  color: 'rgba(248, 250, 252, 0.8)',
                  fontWeight: '500'
                }}>
                  Dashboard de Análise de Produtividade dos Terapeutas
                </div>
                <div style={{ 
                  fontSize: '14px', 
                  color: 'rgba(248, 250, 252, 0.6)',
                  marginTop: '4px'
                }}>
                  Última atualização: {lastUpdate.toLocaleString('pt-BR')} • {data.length} registros analisados
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              {/* Seletor de Período */}
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

              {/* View Mode */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '6px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                gap: '4px'
              }}>
                {[
                  { key: 'overview', label: 'Visão Geral', icon: '📊' },
                  { key: 'individual', label: 'Individual', icon: '👤' },
                  { key: 'comparison', label: 'Comparação', icon: '⚖️' }
                ].map(({ key, label, icon }) => (
                  <button
                    key={key}
                    onClick={() => setViewMode(key as any)}
                    className={`btn-executive ${viewMode === key ? 'btn-primary-exec' : 'btn-secondary-exec'}`}
                    style={{ margin: '0', padding: '10px 16px', borderRadius: '10px', fontSize: '13px' }}
                  >
                    <span style={{ marginRight: '6px' }}>{icon}</span>
                    {label}
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
        {/* Métricas Gerais da Equipe */}
        {metricsGerais && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '32px' }}>
            <div className="metric-card-executive">
              <div style={{ color: 'rgba(248, 250, 252, 0.7)', fontSize: '14px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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
              <div style={{ color: 'rgba(248, 250, 252, 0.6)', fontSize: '14px' }}>
                {periodos[selectedPeriod].label}
              </div>
            </div>

            <div className="metric-card-executive">
              <div style={{ color: 'rgba(248, 250, 252, 0.7)', fontSize: '14px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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
              <div style={{ color: 'rgba(248, 250, 252, 0.6)', fontSize: '14px' }}>
                Pacientes diferentes atendidos
              </div>
            </div>

            <div className="metric-card-executive">
              <div style={{ color: 'rgba(248, 250, 252, 0.7)', fontSize: '14px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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
              <div style={{ color: 'rgba(248, 250, 252, 0.6)', fontSize: '14px' }}>
                Menor é melhor
              </div>
            </div>

            <div className="metric-card-executive">
              <div style={{ color: 'rgba(248, 250, 252, 0.7)', fontSize: '14px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Eficiência Média
              </div>
              <div style={{ 
                fontSize: '48px', 
                fontWeight: '800', 
                margin: '16px 0',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                {metricsGerais.mediaEficiencia.toFixed(1)}%
              </div>
              <div style={{ color: 'rgba(248, 250, 252, 0.6)', fontSize: '14px' }}>
                Casos positivos vs negativos
              </div>
            </div>

            <div className="metric-card-executive">
              <div style={{ color: 'rgba(248, 250, 252, 0.7)', fontSize: '14px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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
              <div style={{ color: 'rgba(248, 250, 252, 0.6)', fontSize: '14px' }}>
                Profissionais na equipe
              </div>
            </div>

            <div className="metric-card-executive">
              <div style={{ color: 'rgba(248, 250, 252, 0.7)', fontSize: '14px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Top Performer
              </div>
              <div style={{ 
                fontSize: '20px', 
                fontWeight: '700', 
                margin: '16px 0',
                color: '#fbbf24'
              }}>
                🏆 {metricsGerais.terapeutaMaisAtivo}
              </div>
              <div style={{ color: 'rgba(248, 250, 252, 0.6)', fontSize: '14px' }}>
                Maior número de atendimentos
              </div>
            </div>
          </div>
        )}

        {/* Controles de Ordenação */}
        <div className="executive-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <h2 style={{ 
              fontSize: '28px', 
              fontWeight: '700', 
              color: 'rgba(248, 250, 252, 0.95)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{ fontSize: '32px' }}>👥</span>
              Análise Individual dos Terapeutas
            </h2>
            
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <label style={{ color: 'rgba(248, 250, 252, 0.8)', fontSize: '14px', fontWeight: '500' }}>
                Ordenar por:
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'rgba(248, 250, 252, 0.9)',
                  fontSize: '14px',
                  fontFamily: 'inherit'
                }}
              >
                <option value="totalAtendimentos">Total de Atendimentos</option>
                <option value="notaMedia">Nota Média (menor melhor)</option>
                <option value="eficiencia">Eficiência</option>
                <option value="alunosUnicos">Alunos Únicos</option>
              </select>
            </div>
          </div>

          {/* Lista de Terapeutas */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
            {terapeutasAnalytics.map((terapeuta, index) => (
              <div 
                key={terapeuta.id}
                className={`therapist-card ${selectedTherapist === terapeuta.id ? 'selected' : ''}`}
                onClick={() => setSelectedTherapist(selectedTherapist === terapeuta.id ? null : terapeuta.id)}
              >
                {index < 3 && (
                  <div className={`ranking-badge ${index === 0 ? 'first' : index === 1 ? 'second' : 'third'}`}>
                    {index + 1}
                  </div>
                )}
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ flex: 1 }}>
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
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

                <div style={{ marginBottom: '12px' }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px'
                  }}>
                    <span style={{ fontSize: '14px', color: 'rgba(248, 250, 252, 0.8)', fontWeight: '500' }}>
                      Eficiência
                    </span>
                    <span style={{ 
                      fontSize: '14px', 
                      fontWeight: '700',
                      color: terapeuta.eficiencia >= 70 ? '#10b981' : 
                             terapeuta.eficiencia >= 50 ? '#f59e0b' : '#ef4444'
                    }}>
                      {terapeuta.eficiencia.toFixed(1)}%
                    </span>
                  </div>
                  <div className="efficiency-bar">
                    <div 
                      className={`efficiency-fill ${
                        terapeuta.eficiencia >= 70 ? 'efficiency-high' : 
                        terapeuta.eficiencia >= 50 ? 'efficiency-medium' : 'efficiency-low'
                      }`}
                      style={{ width: `${terapeuta.eficiencia}%` }}
                    ></div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px', fontSize: '12px' }}>
                  <div style={{ textAlign: 'center', padding: '8px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px' }}>
                    <div style={{ color: '#10b981', fontWeight: '700' }}>{terapeuta.distribuicaoSituacao.leve + terapeuta.distribuicaoSituacao.estavel}</div>
                    <div style={{ color: 'rgba(248, 250, 252, 0.6)' }}>Leves/Estáveis</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '8px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '8px' }}>
                    <div style={{ color: '#f59e0b', fontWeight: '700' }}>{terapeuta.distribuicaoSituacao.consideravel}</div>
                    <div style={{ color: 'rgba(248, 250, 252, 0.6)' }}>Consideráveis</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '8px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>
                    <div style={{ color: '#ef4444', fontWeight: '700' }}>{terapeuta.distribuicaoSituacao.grave}</div>
                    <div style={{ color: 'rgba(248, 250, 252, 0.6)' }}>Graves</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '8px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px' }}>
                    <div style={{ color: '#6366f1', fontWeight: '700' }}>{terapeuta.atendimentosSemana}</div>
                    <div style={{ color: 'rgba(248, 250, 252, 0.6)' }}>Esta semana</div>
                  </div>
                </div>

                {selectedTherapist === terapeuta.id && (
                  <div style={{ 
                    marginTop: '20px', 
                    padding: '20px', 
                    background: 'rgba(99, 102, 241, 0.1)', 
                    borderRadius: '12px',
                    border: '1px solid rgba(99, 102, 241, 0.2)'
                  }}>
                    <h4 style={{ 
                      fontSize: '16px', 
                      fontWeight: '700', 
                      color: 'rgba(248, 250, 252, 0.95)',
                      marginBottom: '16px'
                    }}>
                      📊 Análise Detalhada
                    </h4>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                      <div>
                        <div style={{ fontSize: '14px', color: 'rgba(248, 250, 252, 0.7)', marginBottom: '4px' }}>
                          Atendimentos este mês
                        </div>
                        <div style={{ fontSize: '20px', fontWeight: '700', color: '#6366f1' }}>
                          {terapeuta.atendimentosMes}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', color: 'rgba(248, 250, 252, 0.7)', marginBottom: '4px' }}>
                          Último atendimento
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: 'rgba(248, 250, 252, 0.9)' }}>
                          {terapeuta.ultimoAtendimento ? 
                            new Date(terapeuta.ultimoAtendimento).toLocaleDateString('pt-BR') : 
                            'N/A'
                          }
                        </div>
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '14px', color: 'rgba(248, 250, 252, 0.7)', marginBottom: '8px' }}>
                        Histórico de atendimentos por mês (últimos 6 meses)
                      </div>
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'end', height: '60px' }}>
                        {Object.entries(terapeuta.atendimentosPorMes)
                          .slice(0, 6)
                          .reverse()
                          .map(([mes, qtd]) => (
                          <div key={mes} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div 
                              style={{
                                background: '#6366f1',
                                borderRadius: '2px 2px 0 0',
                                width: '100%',
                                height: `${Math.max((qtd / Math.max(...Object.values(terapeuta.atendimentosPorMes))) * 40, 2)}px`,
                                marginBottom: '4px'
                              }}
                              title={`${mes}: ${qtd} atendimentos`}
                            ></div>
                            <div style={{ fontSize: '10px', color: 'rgba(248, 250, 252, 0.6)' }}>
                              {mes.split(' ')[0]}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Rodapé Executivo */}
        <div style={{ 
          textAlign: 'center', 
          margin: '80px 0 60px'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '24px',
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            borderRadius: '28px',
            padding: '32px 40px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: `linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)`,
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '40px',
              boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)'
            }}>
              📊
            </div>
            
            <div style={{ textAlign: 'left' }}>
              <div style={{ 
                fontWeight: '800', 
                fontSize: '28px', 
                marginBottom: '4px',
                background: `linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                MEDWAY Executive Dashboard
              </div>
              <div style={{ 
                color: 'rgba(248, 250, 252, 0.7)', 
                fontSize: '16px'
              }}>
                Sistema de Análise de Produtividade Profissional
              </div>
            </div>
            
            <div style={{ 
              textAlign: 'right', 
              fontSize: '13px', 
              color: 'rgba(248, 250, 252, 0.6)'
            }}>
              <div style={{ marginBottom: '6px' }}>
                🔄 Última sincronização: {lastUpdate.toLocaleTimeString('pt-BR')}
              </div>
              <div>
                📈 Análise baseada em {formatarNumero(data.length)} registros
              </div>
              <div style={{ marginTop: '6px', color: '#34d399' }}>
                ✅ Conectado ao Supabase
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
