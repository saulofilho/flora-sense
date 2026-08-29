import React, { useState } from 'react';
import { 
  Droplet, 
  Thermometer, 
  Sun, 
  Battery, 
  Twitter, 
  AlertTriangle, 
  CheckCircle2, 
  Settings2, 
  Radio, 
  Zap, 
  Send,
  Bell,
  RefreshCw,
  Flame,
  Clock,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { Plant, SensorReading } from '../types';
import { generatePlantTweetText, buildTwitterIntentUrl } from '../utils/twitter';
import { dispatchPlantAlert } from '../utils/notifications';

interface PlantDetailViewProps {
  plant: Plant;
  rollingReadings: SensorReading[];
  onWater: (plantId: string) => void;
  onSimulateDryOut: (plantId: string) => void;
  onOpenCalibration: (plant: Plant) => void;
  onOpenTwitter: (plant: Plant) => void;
  onPostTweet: (plant: Plant, reason: 'thirst_alert' | 'critical_thirst' | 'watered' | 'manual', customText?: string) => void;
  isSimulating: boolean;
}

export const PlantDetailView: React.FC<PlantDetailViewProps> = ({
  plant,
  rollingReadings,
  onWater,
  onSimulateDryOut,
  onOpenCalibration,
  onOpenTwitter,
  onPostTweet,
  isSimulating,
}) => {
  const { currentReading, calibration, twitter } = plant;
  const moisture = currentReading.moisture;
  const minThreshold = calibration.minMoistureThreshold;
  const critThreshold = calibration.criticalMoistureThreshold;
  const maxThreshold = calibration.maxMoistureThreshold;

  const [previewTweet, setPreviewTweet] = useState(() => 
    generatePlantTweetText(plant, moisture <= minThreshold ? 'thirst_alert' : 'daily_update')
  );

  const handleRefreshTweetPreview = () => {
    const next = generatePlantTweetText(plant, moisture <= minThreshold ? 'thirst_alert' : 'daily_update');
    setPreviewTweet(next);
  };

  const handleTestMobileAlert = () => {
    dispatchPlantAlert({
      title: `🚨 Alerta de Sede: ${plant.name}`,
      body: `A umidade do solo está em ${moisture.toFixed(1)}% (mínimo recomendado: ${minThreshold}%). Regue sua planta!`,
      plantId: plant.id,
    });
  };

  // Status text & colors
  let statusText = 'Solo com Umidade Ideal';
  let statusColor = 'text-emerald-400';
  let statusBg = 'bg-emerald-500/10 border-emerald-500/30';
  let gaugeStroke = '#10b981';

  if (moisture <= critThreshold) {
    statusText = 'Sede Crítica! Risco de Murcha 🚨';
    statusColor = 'text-rose-400';
    statusBg = 'bg-rose-500/20 border-rose-500/40 animate-pulse';
    gaugeStroke = '#f43f5e';
  } else if (moisture <= minThreshold) {
    statusText = 'Solo Seco - Necessita de Rega 🥀';
    statusColor = 'text-amber-400';
    statusBg = 'bg-amber-500/10 border-amber-500/30';
    gaugeStroke = '#f59e0b';
  } else if (moisture >= maxThreshold) {
    statusText = 'Solo Encharcado / Excesso de Água 💧';
    statusColor = 'text-blue-400';
    statusBg = 'bg-blue-500/10 border-blue-500/30';
    gaugeStroke = '#3b82f6';
  }

  // Calculate gauge parameters
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, moisture)) / 100) * circumference;

  // Format time since last watered
  const hoursSinceWater = Math.round((Date.now() - plant.lastWateredTimestamp) / 3600000);
  const lastWaterStr = hoursSinceWater < 1 
    ? 'Há menos de 1 hora' 
    : hoursSinceWater < 24 
    ? `Há ${hoursSinceWater} horas` 
    : `Há ${Math.round(hoursSinceWater / 24)} dias`;

  return (
    <div className="space-y-6">
      
      {/* Top Banner Card */}
      <div className="rounded-3xl p-6 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div 
          className="absolute -right-20 -top-20 w-64 h-64 rounded-full opacity-15 blur-3xl pointer-events-none"
          style={{ backgroundColor: gaugeStroke }}
        />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-800/90 border border-slate-700 flex items-center justify-center text-3xl shadow-inner">
              {plant.avatar || '🌿'}
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h2 className="text-2xl font-extrabold text-white tracking-tight">
                  {plant.name}
                </h2>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusBg} ${statusColor}`}>
                  {statusText}
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-0.5">
                <span className="font-medium italic text-slate-300">{plant.species}</span> • 📍 {plant.location}
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              id="btn-water-now"
              onClick={() => onWater(plant.id)}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/50 transition-all cursor-pointer active:scale-95"
            >
              <Droplet className="w-4 h-4 fill-current" />
              <span>Regar Planta 💧</span>
            </button>

            <button
              id="btn-simulate-dry"
              onClick={() => onSimulateDryOut(plant.id)}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 font-semibold text-xs transition-all cursor-pointer"
              title="Reduz a umidade para simular sede e testar alertas"
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Simular Sede 🥀</span>
            </button>

            <button
              id="btn-test-alert"
              onClick={handleTestMobileAlert}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-all cursor-pointer"
              title="Disparar som e notificação no navegador/celular"
            >
              <Bell className="w-3.5 h-3.5 text-amber-400" />
              <span>Testar Alarme</span>
            </button>

            <button
              id="btn-calib-settings"
              onClick={() => onOpenCalibration(plant)}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-all cursor-pointer"
            >
              <Settings2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Limites & Calibração</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Telemetry Visualizer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Big Soil Moisture Gauge */}
        <div className="lg:col-span-5 rounded-3xl p-6 bg-slate-900/80 border border-slate-800 flex flex-col items-center justify-between relative">
          <div className="w-full flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Sensor de Umidade do Solo</span>
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
              ADC: {currentReading.rawAdc || '720'}
            </span>
          </div>

          {/* SVG Dial Gauge */}
          <div className="relative w-48 h-48 my-2">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="stroke-slate-800"
                strokeWidth="12"
                fill="transparent"
              />
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke={gaugeStroke}
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-4xl font-extrabold tracking-tight text-white font-['Outfit']">
                {moisture.toFixed(1)}%
              </span>
              <span className={`text-xs font-bold mt-1 ${statusColor}`}>
                {moisture <= minThreshold ? 'Abaixo do Limite' : 'Faixa Adequada'}
              </span>
            </div>
          </div>

          {/* Threshold zone visual bar */}
          <div className="w-full mt-4 space-y-2">
            <div className="flex justify-between text-[11px] text-slate-400 font-medium">
              <span className="text-rose-400">Crítico: &lt;{critThreshold}%</span>
              <span className="text-amber-400">Sede: &lt;{minThreshold}%</span>
              <span className="text-emerald-400">Ideal: {calibration.idealMoistureRange[0]}–{calibration.idealMoistureRange[1]}%</span>
              <span className="text-blue-400">Encharcado: &gt;{maxThreshold}%</span>
            </div>
            
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden flex relative">
              <div style={{ width: `${critThreshold}%` }} className="h-full bg-rose-500/80" />
              <div style={{ width: `${minThreshold - critThreshold}%` }} className="h-full bg-amber-500/80" />
              <div style={{ width: `${maxThreshold - minThreshold}%` }} className="h-full bg-emerald-500/80" />
              <div style={{ width: `${100 - maxThreshold}%` }} className="h-full bg-blue-500/80" />
              {/* Current moisture needle */}
              <div 
                className="absolute top-0 bottom-0 w-1.5 bg-white shadow-lg transition-all duration-500 rounded-full"
                style={{ left: `${Math.min(99, Math.max(1, moisture))}%` }}
              />
            </div>
          </div>
        </div>

        {/* Environmental Sensors & Secondary Gauges */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Temperature */}
          <div className="rounded-2xl p-5 bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Temperatura do Ar / Solo</span>
              <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                <Thermometer className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-white">
                {currentReading.temperature.toFixed(1)} <span className="text-lg text-slate-400 font-normal">°C</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Sensor DHT11 / DHT22 • Faixa ótima: 18°C a 28°C
              </p>
            </div>
          </div>

          {/* Sunlight / LDR */}
          <div className="rounded-2xl p-5 bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Luminosidade Solar</span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Sun className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-white">
                {Math.round(currentReading.light)} <span className="text-lg text-slate-400 font-normal">lux</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {currentReading.light > 600 ? '☀️ Luz Solar Direta' : currentReading.light > 250 ? '⛅ Luz Indireta Ideal' : '🌑 Sombra'}
              </p>
            </div>
          </div>

          {/* Last Watered */}
          <div className="rounded-2xl p-5 bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Última Rega Registrada</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-xl font-bold text-white">
                {lastWaterStr}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Ciclo estimado de rega: a cada 3 a 5 dias
              </p>
            </div>
          </div>

          {/* Battery & Hardware Link */}
          <div className="rounded-2xl p-5 bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Dispositivo Arduino / ESP32</span>
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                <Battery className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-xl font-bold text-white flex items-center space-x-2">
                <span>{currentReading.battery || 95}%</span>
                <span className="text-xs text-emerald-400 font-normal bg-emerald-500/10 px-2 py-0.5 rounded">
                  {plant.bluetoothConnected ? 'Bluetooth BLE Ativo' : isSimulating ? 'Simulador Ativo' : 'Pronto'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 font-mono truncate">
                {plant.bluetoothDeviceName || 'Arduino_BLE_Node'}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Twitter Bot Quick Banner */}
      <div className="rounded-3xl p-6 bg-slate-900/90 border border-sky-500/30 shadow-lg relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-2xl text-sky-400 shrink-0">
              <Twitter className="w-6 h-6 fill-current" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-base font-bold text-white">
                  Conta Twitter da Planta: <span className="text-sky-400">@{twitter.handle}</span>
                </h4>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300">
                  {twitter.tone === 'dramatic' ? 'Dramática 🥀' : twitter.tone === 'cute' ? 'Fofa 🌱' : twitter.tone === 'funny' ? 'Irônica 🌵' : 'Científica 📊'}
                </span>
              </div>
              
              {/* Preview bubble */}
              <div className="mt-2 p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 font-sans max-w-2xl">
                <span className="text-sky-400 font-bold mr-1">Próximo Tweet Gerado:</span>
                "{previewTweet}"
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={handleRefreshTweetPreview}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
              title="Gerar outra variação de texto"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <a
              href={buildTwitterIntentUrl(previewTweet)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs shadow-lg shadow-sky-950/50 transition-all"
            >
              <Twitter className="w-3.5 h-3.5 fill-current" />
              <span>Abrir no X / Twitter</span>
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </a>

            <button
              onClick={() => onPostTweet(plant, moisture <= minThreshold ? 'thirst_alert' : 'manual', previewTweet)}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-all"
            >
              <Send className="w-3.5 h-3.5 text-sky-400" />
              <span>Publicar no Feed</span>
            </button>

            <button
              onClick={() => onOpenTwitter(plant)}
              className="px-3 py-2 rounded-xl bg-sky-950/60 hover:bg-sky-900/60 text-sky-300 border border-sky-500/30 text-xs font-semibold transition-all"
            >
              Painel Twitter Completo →
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};
