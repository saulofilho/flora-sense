import React, { useState } from 'react';
import { 
  Settings2, 
  Droplet, 
  Bell, 
  Check, 
  Sliders, 
  Volume2, 
  Vibrate, 
  Sparkles, 
  HelpCircle,
  X,
  Radio
} from 'lucide-react';
import { Plant, CalibrationSettings, PlantNotificationConfig } from '../types';

interface ThresholdSettingsModalProps {
  plant: Plant;
  isOpen: boolean;
  onClose: () => void;
  onSave: (plantId: string, calibration: CalibrationSettings, notifications: PlantNotificationConfig) => void;
}

export const ThresholdSettingsModal: React.FC<ThresholdSettingsModalProps> = ({
  plant,
  isOpen,
  onClose,
  onSave,
}) => {
  const [minMoisture, setMinMoisture] = useState(plant.calibration.minMoistureThreshold);
  const [critMoisture, setCritMoisture] = useState(plant.calibration.criticalMoistureThreshold);
  const [maxMoisture, setMaxMoisture] = useState(plant.calibration.maxMoistureThreshold);
  const [idealMin, setIdealMin] = useState(plant.calibration.idealMoistureRange[0]);
  const [idealMax, setIdealMax] = useState(plant.calibration.idealMoistureRange[1]);

  const [rawAirValue, setRawAirValue] = useState(plant.calibration.rawAirValue);
  const [rawWaterValue, setRawWaterValue] = useState(plant.calibration.rawWaterValue);

  // Notification toggles
  const [enablePush, setEnablePush] = useState(plant.notifications.enableMobilePush);
  const [enableSound, setEnableSound] = useState(plant.notifications.enableSoundAlerts);
  const [enableVib, setEnableVib] = useState(plant.notifications.enableVibration);
  const [notifyOnThirst, setNotifyOnThirst] = useState(plant.notifications.notifyOnCriticalThirst);
  const [notifyOnWatered, setNotifyOnWatered] = useState(plant.notifications.notifyOnWatered);

  if (!isOpen) return null;

  const handleApplyPreset = (type: 'cacto' | 'folhagem' | 'tropical' | 'horta') => {
    if (type === 'cacto') {
      setMinMoisture(15);
      setCritMoisture(8);
      setMaxMoisture(60);
      setIdealMin(20);
      setIdealMax(45);
    } else if (type === 'folhagem') {
      setMinMoisture(35);
      setCritMoisture(18);
      setMaxMoisture(85);
      setIdealMin(40);
      setIdealMax(75);
    } else if (type === 'tropical') {
      setMinMoisture(45);
      setCritMoisture(25);
      setMaxMoisture(90);
      setIdealMin(50);
      setIdealMax(80);
    } else if (type === 'horta') {
      setMinMoisture(40);
      setCritMoisture(20);
      setMaxMoisture(85);
      setIdealMin(45);
      setIdealMax(80);
    }
  };

  const handleSave = () => {
    const updatedCalibration: CalibrationSettings = {
      minMoistureThreshold: Number(minMoisture),
      criticalMoistureThreshold: Number(critMoisture),
      maxMoistureThreshold: Number(maxMoisture),
      idealMoistureRange: [Number(idealMin), Number(idealMax)],
      rawAirValue: Number(rawAirValue),
      rawWaterValue: Number(rawWaterValue),
    };

    const updatedNotifications: PlantNotificationConfig = {
      enableMobilePush: enablePush,
      enableSoundAlerts: enableSound,
      enableVibration: enableVib,
      notifyOnCriticalThirst: notifyOnThirst,
      notifyOnIdealRange: false,
      notifyOnWatered: notifyOnWatered,
    };

    onSave(plant.id, updatedCalibration, updatedNotifications);
    onClose();
  };

  // Preview conversion calculation
  const currentAdc = plant.currentReading.rawAdc || 720;
  const calcPct = Math.max(0, Math.min(100, Math.round(((rawAirValue - currentAdc) / (rawAirValue - rawWaterValue)) * 100)));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Settings2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                Calibração de Limites & Alertas: {plant.name}
              </h3>
              <p className="text-xs text-slate-400">
                Ajuste os parâmetros de umidade para disparo de alarmes e tweets
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Species Presets Quick Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300">
            Perfis Recomendados por Tipo de Planta:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => handleApplyPreset('folhagem')}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 text-xs font-medium text-slate-300 hover:text-white transition-all text-left"
            >
              🌿 Folhagem / Monstera
              <span className="block text-[10px] text-slate-500">Mín: 35%</span>
            </button>
            <button
              onClick={() => handleApplyPreset('cacto')}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 text-xs font-medium text-slate-300 hover:text-white transition-all text-left"
            >
              🌵 Suculenta / Cacto
              <span className="block text-[10px] text-slate-500">Mín: 15%</span>
            </button>
            <button
              onClick={() => handleApplyPreset('tropical')}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 text-xs font-medium text-slate-300 hover:text-white transition-all text-left"
            >
              🪴 Samambaia / Tropical
              <span className="block text-[10px] text-slate-500">Mín: 45%</span>
            </button>
            <button
              onClick={() => handleApplyPreset('horta')}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 text-xs font-medium text-slate-300 hover:text-white transition-all text-left"
            >
              🌱 Horta / Manjericão
              <span className="block text-[10px] text-slate-500">Mín: 40%</span>
            </button>
          </div>
        </div>

        {/* Moisture Limits Sliders */}
        <div className="space-y-4 p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5">
            <Droplet className="w-3.5 h-3.5" />
            <span>Limites de Umidade (%)</span>
          </h4>

          {/* Sede Mínima Threshold */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-amber-400">Limite de Sede (Gera Tweet e Notificação):</span>
              <span className="text-white font-bold">{minMoisture}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="60"
              value={minMoisture}
              onChange={(e) => setMinMoisture(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
            <p className="text-[11px] text-slate-400 mt-0.5">
              Quando a umidade cair abaixo deste valor, o aplicativo emitirá alerta de rega.
            </p>
          </div>

          {/* Sede Crítica Threshold */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-rose-400">Limite Crítico de Emergência:</span>
              <span className="text-white font-bold">{critMoisture}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="30"
              value={critMoisture}
              onChange={(e) => setCritMoisture(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
            <p className="text-[11px] text-slate-400 mt-0.5">
              Dispara tweet dramático de socorro e alarme sonoro insistente.
            </p>
          </div>

          {/* Ideal Range */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-xs text-slate-300 font-medium">Faixa Ideal Mínima (%)</label>
              <input
                type="number"
                value={idealMin}
                onChange={(e) => setIdealMin(Number(e.target.value))}
                className="w-full mt-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-xs text-slate-300 font-medium">Faixa Ideal Máxima (%)</label>
              <input
                type="number"
                value={idealMax}
                onChange={(e) => setIdealMax(Number(e.target.value))}
                className="w-full mt-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
              />
            </div>
          </div>
        </div>

        {/* Hardware ADC Calibration Settings */}
        <div className="space-y-4 p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center space-x-1.5">
              <Radio className="w-3.5 h-3.5" />
              <span>Calibração dos Valores Analógicos do Sensor (ADC)</span>
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">
              Leitura Atual: {currentAdc} ADC ≈ {calcPct}%
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-300 font-medium">
                Valor do Sensor no Ar Seco (0% Umidade)
              </label>
              <input
                type="number"
                value={rawAirValue}
                onChange={(e) => setRawAirValue(Number(e.target.value))}
                className="w-full mt-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono"
              />
              <p className="text-[10px] text-slate-500 mt-0.5">
                Padrão Arduino: ~850 a 1023 | ESP32: ~3000 a 3500
              </p>
            </div>

            <div>
              <label className="text-xs text-slate-300 font-medium">
                Valor do Sensor Submerso em Água (100% Umidade)
              </label>
              <input
                type="number"
                value={rawWaterValue}
                onChange={(e) => setRawWaterValue(Number(e.target.value))}
                className="w-full mt-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono"
              />
              <p className="text-[10px] text-slate-500 mt-0.5">
                Padrão Arduino: ~350 a 450 | ESP32: ~1100 a 1400
              </p>
            </div>
          </div>
        </div>

        {/* Notifications & Mobile Push Preferences */}
        <div className="space-y-3 p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center space-x-1.5">
            <Bell className="w-3.5 h-3.5 text-amber-400" />
            <span>Canais de Notificação</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="flex items-center space-x-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={enablePush}
                onChange={(e) => setEnablePush(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded"
              />
              <span className="text-xs text-slate-200">Alertas Mobile/Web</span>
            </label>

            <label className="flex items-center space-x-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={enableSound}
                onChange={(e) => setEnableSound(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded"
              />
              <span className="text-xs text-slate-200">Beep Sonoro</span>
            </label>

            <label className="flex items-center space-x-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={enableVib}
                onChange={(e) => setEnableVib(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded"
              />
              <span className="text-xs text-slate-200">Vibração Celular</span>
            </label>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/40 transition-all flex items-center space-x-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Salvar Calibração</span>
          </button>
        </div>

      </div>
    </div>
  );
};
