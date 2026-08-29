import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ReferenceLine, 
  CartesianGrid,
  LineChart,
  Line
} from 'recharts';
import { 
  Calendar, 
  Droplet, 
  Thermometer, 
  Sun, 
  Download, 
  TrendingDown, 
  TrendingUp,
  Activity,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { Plant, HistoricalDataPoint } from '../types';

interface WeeklyHistoryChartProps {
  plant: Plant;
}

export const WeeklyHistoryChart: React.FC<WeeklyHistoryChartProps> = ({ plant }) => {
  const [timeRange, setTimeRange] = useState<'24h' | '3d' | '7d'>('7d');
  const [activeMetric, setActiveMetric] = useState<'moisture' | 'temperature' | 'light'>('moisture');

  const historyData = plant.history || [];

  // Filter based on selected time range
  const filteredData = useMemo(() => {
    const now = Date.now();
    const rangeMs = {
      '24h': 24 * 3600 * 1000,
      '3d': 3 * 24 * 3600 * 1000,
      '7d': 7 * 24 * 3600 * 1000,
    }[timeRange];

    return historyData.filter((item) => now - item.timestamp <= rangeMs);
  }, [historyData, timeRange]);

  // Compute analytics
  const stats = useMemo(() => {
    if (filteredData.length === 0) {
      return { avgMoisture: 0, minMoisture: 0, maxMoisture: 0, waterCount: 0, avgTemp: 0 };
    }
    const moistures = filteredData.map((d) => d.moisture);
    const temps = filteredData.map((d) => d.temperature);
    const waterCount = filteredData.filter((d) => d.wasWatered).length;

    const avgMoisture = moistures.reduce((a, b) => a + b, 0) / moistures.length;
    const minMoisture = Math.min(...moistures);
    const maxMoisture = Math.max(...moistures);
    const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;

    return {
      avgMoisture: Number(avgMoisture.toFixed(1)),
      minMoisture: Number(minMoisture.toFixed(1)),
      maxMoisture: Number(maxMoisture.toFixed(1)),
      waterCount,
      avgTemp: Number(avgTemp.toFixed(1)),
    };
  }, [filteredData]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = 'Data/Hora,Umidade(%),Temperatura(C),Luz(lux),EventoRega\n';
    const rows = filteredData
      .map(
        (d) =>
          `"${new Date(d.timestamp).toLocaleString('pt-BR')}",${d.moisture},${d.temperature},${d.light},${d.wasWatered ? 'SIM' : 'NAO'}`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `historico_${plant.name.toLowerCase().replace(/\s+/g, '_')}_${timeRange}.csv`;
    link.click();
  };

  const minThresh = plant.calibration.minMoistureThreshold;
  const critThresh = plant.calibration.criticalMoistureThreshold;

  return (
    <div className="space-y-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
            <span>Histórico de Monitoramento: {plant.name}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Registro contínuo de umidade do solo, temperatura e eventos de rega nos últimos dias
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Time range selector */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
            {(['24h', '3d', '7d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  timeRange === range
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {range === '24h' ? '24 Horas' : range === '3d' ? '3 Dias' : '7 Dias'}
              </button>
            ))}
          </div>

          {/* Export button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all"
            title="Exportar dados para planilha CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="rounded-2xl p-4 bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Umidade Média</span>
            <Droplet className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white mt-2">
            {stats.avgMoisture}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center space-x-1">
            <span className={stats.avgMoisture >= minThresh ? 'text-emerald-400' : 'text-amber-400'}>
              {stats.avgMoisture >= minThresh ? '✓ Em nível saudável' : '⚠️ Abaixo do desejado'}
            </span>
          </p>
        </div>

        <div className="rounded-2xl p-4 bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Ponto Mais Seco</span>
            <TrendingDown className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-extrabold text-white mt-2">
            {stats.minMoisture}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Mínimo registrado no período
          </p>
        </div>

        <div className="rounded-2xl p-4 bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Ciclos de Rega</span>
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold text-white mt-2">
            {stats.waterCount} {stats.waterCount === 1 ? 'rega' : 'regas'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Detectadas automaticamente por elevação
          </p>
        </div>

        <div className="rounded-2xl p-4 bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Temp. Média</span>
            <Thermometer className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-white mt-2">
            {stats.avgTemp}°C
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Ambiente e vaso
          </p>
        </div>

      </div>

      {/* Metric Selector Pills */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setActiveMetric('moisture')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
            activeMetric === 'moisture'
              ? 'bg-emerald-600/30 border-emerald-500/50 text-emerald-300'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Droplet className="w-3.5 h-3.5" />
          <span>Curva de Umidade do Solo (%)</span>
        </button>

        <button
          onClick={() => setActiveMetric('temperature')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
            activeMetric === 'temperature'
              ? 'bg-rose-600/30 border-rose-500/50 text-rose-300'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Thermometer className="w-3.5 h-3.5" />
          <span>Temperatura (°C)</span>
        </button>

        <button
          onClick={() => setActiveMetric('light')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
            activeMetric === 'light'
              ? 'bg-amber-600/30 border-amber-500/50 text-amber-300'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sun className="w-3.5 h-3.5" />
          <span>Luminosidade (Lux)</span>
        </button>
      </div>

      {/* Main Interactive Recharts Graph */}
      <div className="rounded-3xl p-6 bg-slate-900/80 border border-slate-800 shadow-xl">
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {activeMetric === 'moisture' ? (
              <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="moistureGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="dateStr" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 11 }} unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(value: any, name: any, item: any) => [
                    `${value}% ${item.payload.wasWatered ? '💧 (Evento de Rega!)' : ''}`,
                    'Umidade do Solo',
                  ]}
                />
                
                {/* Reference line for Thirst limit */}
                <ReferenceLine 
                  y={minThresh} 
                  stroke="#f59e0b" 
                  strokeDasharray="4 4" 
                  label={{ value: `Limite Sede (${minThresh}%)`, fill: '#f59e0b', fontSize: 11, position: 'insideBottomRight' }} 
                />

                {/* Reference line for Critical limit */}
                <ReferenceLine 
                  y={critThresh} 
                  stroke="#f43f5e" 
                  strokeDasharray="4 4" 
                  label={{ value: `Crítico (${critThresh}%)`, fill: '#f43f5e', fontSize: 11, position: 'insideBottomRight' }} 
                />

                <Area
                  type="monotone"
                  dataKey="moisture"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#moistureGradient)"
                />
              </AreaChart>
            ) : activeMetric === 'temperature' ? (
              <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="dateStr" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis domain={[10, 40]} stroke="#64748b" tick={{ fontSize: 11 }} unit="°C" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(value: any) => [`${value}°C`, 'Temperatura']}
                />
                <Area
                  type="monotone"
                  dataKey="temperature"
                  stroke="#f43f5e"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#tempGradient)"
                />
              </AreaChart>
            ) : (
              <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="lightGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="dateStr" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 1000]} stroke="#64748b" tick={{ fontSize: 11 }} unit="lx" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(value: any) => [`${value} lux`, 'Luminosidade Solar']}
                />
                <Area
                  type="monotone"
                  dataKey="light"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#lightGradient)"
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
