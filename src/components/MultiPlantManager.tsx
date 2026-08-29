import React, { useState } from 'react';
import { 
  Plus, 
  X, 
  Sparkles, 
  Check, 
  Droplet, 
  Twitter, 
  Cpu, 
  MapPin, 
  Tag
} from 'lucide-react';
import { Plant, PlantTone, CalibrationSettings } from '../types';

interface MultiPlantManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPlant: (newPlant: Plant) => void;
}

const PLANT_EMOJIS = ['🌿', '🪴', '🌵', '🌱', '🌸', '🎋', '🌾', '🍅', '🌶️', '🌲', '🌻', '🍃'];

const PRESET_SPECIES = [
  {
    name: 'Monstera Deliciosa',
    species: 'Costela-de-Adão',
    minMoisture: 35,
    critMoisture: 18,
    idealRange: [40, 75] as [number, number],
    tone: 'dramatic' as PlantTone,
    bio: 'Sou uma Monstera que tuita toda vez que o solo seca. Salvem minhas folhas!',
  },
  {
    name: 'Samambaia Americana',
    species: 'Nephrolepis exaltata',
    minMoisture: 45,
    critMoisture: 25,
    idealRange: [50, 80] as [number, number],
    tone: 'cute' as PlantTone,
    bio: 'Adoro umidade no ar e na terra! Te lembro com carinho de cuidar de mim ✨',
  },
  {
    name: 'Manjericão da Horta',
    species: 'Ocimum basilicum',
    minMoisture: 35,
    critMoisture: 20,
    idealRange: [40, 75] as [number, number],
    tone: 'funny' as PlantTone,
    bio: 'Quer tempero fresco na comida mas esquece da minha água? Não dou moleza! 🌵',
  },
  {
    name: 'Suculenta Echeveria',
    species: 'Echeveria Elegans',
    minMoisture: 15,
    critMoisture: 8,
    idealRange: [20, 50] as [number, number],
    tone: 'scientific' as PlantTone,
    bio: 'Telemetria automatizada de umidade do substrato via Arduino BLE.',
  },
  {
    name: 'Ficus Lyrata',
    species: 'Figueira-lira',
    minMoisture: 30,
    critMoisture: 15,
    idealRange: [35, 70] as [number, number],
    tone: 'dramatic' as PlantTone,
    bio: 'Planta nobre que exige hidratação periódica pontual. Folhas no topo sempre!',
  },
];

export const MultiPlantManager: React.FC<MultiPlantManagerProps> = ({
  isOpen,
  onClose,
  onAddPlant,
}) => {
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');
  const [location, setLocation] = useState('Sala de Estar');
  const [avatar, setAvatar] = useState('🌿');
  const [twitterHandle, setTwitterHandle] = useState('');
  const [tone, setTone] = useState<PlantTone>('dramatic');
  const [bluetoothDeviceName, setBluetoothDeviceName] = useState('');
  const [minMoisture, setMinMoisture] = useState(35);
  const [critMoisture, setCritMoisture] = useState(18);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: typeof PRESET_SPECIES[0]) => {
    setName(preset.name);
    setSpecies(preset.species);
    setMinMoisture(preset.minMoisture);
    setCritMoisture(preset.critMoisture);
    setTone(preset.tone);
    const cleanHandle = preset.name.toLowerCase().replace(/[^a-z0-9]/g, '') + '_bot';
    setTwitterHandle(cleanHandle);
    setBluetoothDeviceName(`Arduino_${preset.name.split(' ')[0]}_BLE`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const plantId = `plant-${Date.now()}`;
    const handle = twitterHandle.trim().replace(/^@/, '') || `${name.toLowerCase().replace(/\s+/g, '_')}_bot`;

    const newPlant: Plant = {
      id: plantId,
      name: name.trim(),
      species: species.trim() || 'Planta de Vaso',
      location: location.trim() || 'Ambiente Interno',
      avatar,
      color: '#10b981',
      createdAt: Date.now(),
      bluetoothDeviceName: bluetoothDeviceName.trim() || 'FloraSense_Node_BLE',
      bluetoothConnected: false,
      currentReading: {
        timestamp: Date.now(),
        moisture: 55,
        temperature: 24,
        light: 500,
        battery: 100,
        rawAdc: 650,
      },
      status: 'healthy',
      lastWateredTimestamp: Date.now(),
      calibration: {
        rawAirValue: 880,
        rawWaterValue: 380,
        minMoistureThreshold: minMoisture,
        criticalMoistureThreshold: critMoisture,
        maxMoistureThreshold: 85,
        idealMoistureRange: [minMoisture + 5, 75],
      },
      twitter: {
        handle,
        displayName: name.trim(),
        avatarEmoji: avatar,
        bio: `Conta oficial da ${name}. Tuíto automaticamente meus níveis de sede via Arduino IoT! 🌱💧`,
        tone,
        autoTweetOnThirst: true,
        autoTweetOnWatered: true,
        cooldownHours: 2,
      },
      notifications: {
        enableMobilePush: true,
        enableSoundAlerts: true,
        enableVibration: true,
        notifyOnCriticalThirst: true,
        notifyOnIdealRange: false,
        notifyOnWatered: true,
      },
      history: [
        {
          timestamp: Date.now(),
          dateStr: 'Hoje',
          moisture: 55,
          temperature: 24,
          light: 500,
          wasWatered: true,
        }
      ],
    };

    onAddPlant(newPlant);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xl">
              🌱
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                Adicionar Nova Planta para Monitoramento
              </h3>
              <p className="text-xs text-slate-400">
                Cadastre a planta, configure o sensor Arduino e crie a conta no Twitter
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

        {/* Quick Presets */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300">
            Modelos Rápidos (Preenche limites e personalidade):
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {PRESET_SPECIES.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => handleSelectPreset(p)}
                className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 text-xs font-medium text-slate-300 hover:text-white transition-all text-left truncate"
              >
                <div className="font-bold truncate">{p.name}</div>
                <div className="text-[10px] text-slate-500">{p.species}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Avatar Emoji Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Ícone / Avatar da Planta
            </label>
            <div className="flex flex-wrap gap-2">
              {PLANT_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setAvatar(emoji)}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border transition-all ${
                    avatar === emoji
                      ? 'bg-emerald-600/30 border-emerald-500 scale-110 shadow-md'
                      : 'bg-slate-950 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Plant Name & Species */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nome da Planta *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Monstera da Sala"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Espécie Botânica
              </label>
              <input
                type="text"
                value={species}
                onChange={(e) => setSpecies(e.target.value)}
                placeholder="Ex: Monstera Deliciosa"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Location & Bluetooth Tag */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Localização do Vaso
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ex: Sala de Estar, Varanda"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Identificador Bluetooth / ESP32
              </label>
              <input
                type="text"
                value={bluetoothDeviceName}
                onChange={(e) => setBluetoothDeviceName(e.target.value)}
                placeholder="Ex: Arduino_Monstera_BLE"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Twitter Settings */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-sky-400 flex items-center space-x-1.5">
              <Twitter className="w-3.5 h-3.5 fill-current" />
              <span>Conta & Personalidade do Twitter</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1">@ Handle no X / Twitter</label>
                <div className="flex items-center">
                  <span className="px-3 py-2 bg-slate-800 border border-r-0 border-slate-700 text-xs text-slate-400 rounded-l-xl">@</span>
                  <input
                    type="text"
                    value={twitterHandle}
                    onChange={(e) => setTwitterHandle(e.target.value)}
                    placeholder="monstera_dramatica"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-xs text-white rounded-r-xl focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Tom de Voz dos Tweets</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value as PlantTone)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-xs text-white rounded-xl focus:outline-none focus:border-sky-500"
                >
                  <option value="dramatic">🥀 Dramática / Telenovela</option>
                  <option value="cute">🌱 Fofa & Carinhosa</option>
                  <option value="funny">🌵 Humor Ácido / Irônica</option>
                  <option value="scientific">📊 Científica & Robótica</option>
                </select>
              </div>
            </div>
          </div>

          {/* Moisture Limits */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-amber-400 mb-1">
                Limite de Sede (%)
              </label>
              <input
                type="number"
                min="5"
                max="80"
                value={minMoisture}
                onChange={(e) => setMinMoisture(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-rose-400 mb-1">
                Limite Crítico (%)
              </label>
              <input
                type="number"
                min="2"
                max="40"
                value={critMoisture}
                onChange={(e) => setCritMoisture(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end space-x-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/40 flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Salvar Planta & Iniciar Monitoramento</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
