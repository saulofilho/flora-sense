import React from 'react';
import { 
  Droplet, 
  Thermometer, 
  Sun, 
  Battery, 
  Twitter, 
  AlertTriangle, 
  CheckCircle2, 
  Settings2,
  Sparkles,
  ArrowRight,
  Activity
} from 'lucide-react';
import { Plant, PlantStatus } from '../types';

interface PlantCardProps {
  plant: Plant;
  isSelected: boolean;
  onSelect: (plant: Plant) => void;
  onWater: (plantId: string) => void;
  onOpenCalibration: (plant: Plant) => void;
  onOpenTwitter: (plant: Plant) => void;
}

export const PlantCard: React.FC<PlantCardProps> = ({
  plant,
  isSelected,
  onSelect,
  onWater,
  onOpenCalibration,
  onOpenTwitter,
}) => {
  const { currentReading, calibration, twitter } = plant;
  const moisture = currentReading.moisture;
  const minThreshold = calibration.minMoistureThreshold;
  const critThreshold = calibration.criticalMoistureThreshold;

  // Determine current computed status
  let computedStatus: PlantStatus = 'healthy';
  if (moisture <= critThreshold) {
    computedStatus = 'critical';
  } else if (moisture <= minThreshold) {
    computedStatus = 'thirsty';
  } else if (moisture >= calibration.maxMoistureThreshold) {
    computedStatus = 'waterlogged';
  }

  // Color mappings
  const statusConfig = {
    healthy: {
      label: 'Solo Saudável',
      badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      ringColor: '#10b981',
      icon: CheckCircle2,
    },
    thirsty: {
      label: 'Precisa de Água',
      badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      ringColor: '#f59e0b',
      icon: AlertTriangle,
    },
    critical: {
      label: 'Sede Crítica! 🚨',
      badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse',
      ringColor: '#f43f5e',
      icon: AlertTriangle,
    },
    waterlogged: {
      label: 'Solo Encharcado',
      badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      ringColor: '#3b82f6',
      icon: Droplet,
    },
    warning: {
      label: 'Atenção',
      badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      ringColor: '#f59e0b',
      icon: AlertTriangle,
    },
    offline: {
      label: 'Offline',
      badgeBg: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
      ringColor: '#64748b',
      icon: Activity,
    }
  }[computedStatus];

  // SVG Gauge calculations
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, moisture)) / 100) * circumference;

  return (
    <div
      id={`plant-card-${plant.id}`}
      onClick={() => onSelect(plant)}
      className={`group relative rounded-2xl p-5 transition-all duration-300 cursor-pointer border ${
        isSelected
          ? 'bg-slate-900/90 border-emerald-500/60 shadow-xl shadow-emerald-950/30 ring-1 ring-emerald-500/40'
          : 'bg-slate-900/60 hover:bg-slate-900/90 border-slate-800/80 hover:border-slate-700/90'
      }`}
    >
      {/* Top Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800/90 border border-slate-700 flex items-center justify-center text-2xl shadow-inner group-hover:scale-105 transition-transform">
            {plant.avatar || '🌿'}
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center space-x-2">
              <span>{plant.name}</span>
            </h3>
            <p className="text-xs text-slate-400 font-medium italic">
              {plant.species}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusConfig.badgeBg}`}>
          <statusConfig.icon className="w-3 h-3" />
          <span>{statusConfig.label}</span>
        </span>
      </div>

      {/* Main Gauge & Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 mt-5 items-center">
        
        {/* Circular Gauge */}
        <div className="sm:col-span-5 flex flex-col items-center justify-center">
          <div className="relative w-24 h-24">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 96 96">
              {/* Background Track */}
              <circle
                cx="48"
                cy="48"
                r={radius}
                className="stroke-slate-800"
                strokeWidth="7"
                fill="transparent"
              />
              {/* Active Progress */}
              <circle
                cx="48"
                cy="48"
                r={radius}
                stroke={statusConfig.ringColor}
                strokeWidth="7"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-extrabold tracking-tight text-white">
                {Math.round(moisture)}%
              </span>
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                Umidade
              </span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 mt-2 flex items-center space-x-1">
            <span>Limite Mín:</span>
            <span className="font-bold text-amber-400">{minThreshold}%</span>
          </div>
        </div>

        {/* Environmental Telemetry */}
        <div className="sm:col-span-7 space-y-2">
          {/* Temperature */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/50 border border-slate-800/80">
            <div className="flex items-center space-x-2">
              <Thermometer className="w-3.5 h-3.5 text-rose-400" />
              <span className="text-xs text-slate-300">Temperatura</span>
            </div>
            <span className="text-xs font-bold text-white">
              {currentReading.temperature.toFixed(1)}°C
            </span>
          </div>

          {/* Sunlight */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/50 border border-slate-800/80">
            <div className="flex items-center space-x-2">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs text-slate-300">Luminosidade</span>
            </div>
            <span className="text-xs font-bold text-white">
              {Math.round(currentReading.light)} lux
            </span>
          </div>

          {/* Twitter Handle */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/50 border border-slate-800/80">
            <div className="flex items-center space-x-2 truncate">
              <Twitter className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span className="text-xs text-slate-300 truncate">@{twitter.handle}</span>
            </div>
            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20 shrink-0">
              {twitter.tone === 'dramatic' ? 'Dramática' : twitter.tone === 'cute' ? 'Fofa' : twitter.tone === 'funny' ? 'Irônica' : 'Científica'}
            </span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-800/80">
        <div className="flex items-center space-x-1.5">
          <button
            id={`btn-water-${plant.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onWater(plant.id);
            }}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all"
            title="Simular ou registrar evento de rega"
          >
            <Droplet className="w-3.5 h-3.5 fill-current" />
            <span>Regar 💧</span>
          </button>

          <button
            id={`btn-tweet-plant-${plant.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onOpenTwitter(plant);
            }}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 text-xs font-medium transition-all"
            title="Ver Twitter Bot desta planta"
          >
            <Twitter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tweet</span>
          </button>

          <button
            id={`btn-calib-plant-${plant.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onOpenCalibration(plant);
            }}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-all"
            title="Ajustar limites de umidade"
          >
            <Settings2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center text-xs font-semibold text-emerald-400 group-hover:translate-x-1 transition-transform">
          <span>Ver Detalhes</span>
          <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </div>
      </div>
    </div>
  );
};
