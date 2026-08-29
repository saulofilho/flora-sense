import React, { useState, useEffect, useRef } from 'react';
import { 
  Bluetooth, 
  BluetoothConnected, 
  BluetoothOff, 
  Radio, 
  Terminal, 
  Sparkles, 
  RefreshCw, 
  Send, 
  X, 
  Sliders, 
  Droplet, 
  Flame, 
  Cpu, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Play,
  Square
} from 'lucide-react';
import { BluetoothConnectionStatus, BluetoothLogMessage, SensorReading } from '../types';
import { bluetoothService } from '../utils/bluetooth';

interface BluetoothManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: BluetoothConnectionStatus;
  deviceName?: string;
  logs: BluetoothLogMessage[];
  currentReading: SensorReading;
  onConnectWebBluetooth: () => Promise<void>;
  onDisconnect: () => void;
  onStartSimulation: () => void;
  onStopSimulation: () => void;
  onSimulateWatering: () => void;
  onSimulateDryOut: () => void;
  onUpdateManualSliders: (m: number, t: number, l: number) => void;
  onToggleFastDrying: (fast: boolean) => void;
}

export const BluetoothManagerModal: React.FC<BluetoothManagerModalProps> = ({
  isOpen,
  onClose,
  status,
  deviceName,
  logs,
  currentReading,
  onConnectWebBluetooth,
  onDisconnect,
  onStartSimulation,
  onStopSimulation,
  onSimulateWatering,
  onSimulateDryOut,
  onUpdateManualSliders,
  onToggleFastDrying,
}) => {
  const [commandInput, setCommandInput] = useState('');
  const [sliderMoisture, setSliderMoisture] = useState(currentReading.moisture);
  const [sliderTemp, setSliderTemp] = useState(currentReading.temperature);
  const [sliderLight, setSliderLight] = useState(currentReading.light);
  const [fastDrying, setFastDrying] = useState(false);
  const [activeTab, setActiveTab] = useState<'connect' | 'terminal' | 'simulation'>('connect');

  const logsEndRef = useRef<HTMLDivElement>(null);
  const isSupported = bluetoothService.isWebBluetoothSupported();

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  useEffect(() => {
    setSliderMoisture(currentReading.moisture);
    setSliderTemp(currentReading.temperature);
    setSliderLight(currentReading.light);
  }, [currentReading]);

  if (!isOpen) return null;

  const handleSendCommand = () => {
    if (!commandInput.trim()) return;
    bluetoothService.sendCommand(commandInput.trim());
    setCommandInput('');
  };

  const handleSliderChange = (m: number, t: number, l: number) => {
    setSliderMoisture(m);
    setSliderTemp(t);
    setSliderLight(l);
    onUpdateManualSliders(m, t, l);
  };

  const handleToggleFastDry = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setFastDrying(checked);
    onToggleFastDrying(checked);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Bluetooth className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                Gerenciador Bluetooth & Simulador Arduino
              </h3>
              <p className="text-xs text-slate-400">
                Conecte seu microcontrolador ou teste com o gerador de telemetria em tempo real
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

        {/* Status Pill & Sub Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold ${
              status === 'connected'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : status === 'simulating'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : status === 'connecting'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}>
              <span className="w-2 h-2 rounded-full bg-current"></span>
              <span>
                {status === 'connected' ? `Conectado: ${deviceName || 'Arduino'}` : status === 'simulating' ? 'Modo Simulação Ativo' : status === 'connecting' ? 'Buscando Arduino...' : 'Desconectado'}
              </span>
            </span>
          </div>

          {/* Sub Navigation */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('connect')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'connect' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Conexão BLE
            </button>
            <button
              onClick={() => setActiveTab('simulation')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'simulation' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Controles Simulador
            </button>
            <button
              onClick={() => setActiveTab('terminal')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'terminal' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Terminal Serial ({logs.length})
            </button>
          </div>
        </div>

        {/* Tab 1: Connect Bluetooth */}
        {activeTab === 'connect' && (
          <div className="space-y-4">
            
            {/* Compatibility info banner */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                  <Radio className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Suporte Web Bluetooth API no Navegador</span>
                </span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  isSupported ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                }`}>
                  {isSupported ? '✓ Suportado (Chrome/Edge/Android)' : '⚠️ Não suportado nativamente'}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                A Web Bluetooth API permite parear diretamente com placas <strong>ESP32 BLE, Arduino + HM-10</strong> ou outros módulos Nordic UART sem necessidade de instalar drivers ou aplicativos extras.
              </p>
            </div>

            {/* Connection Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={onConnectWebBluetooth}
                disabled={status === 'connecting'}
                className="p-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 transition-all flex flex-col items-center justify-center space-y-1.5 cursor-pointer disabled:opacity-50"
              >
                <BluetoothConnected className="w-5 h-5" />
                <span>Buscar & Parear Dispositivo Bluetooth</span>
                <span className="text-[10px] font-normal text-emerald-200">Abre janela nativa de pareamento</span>
              </button>

              <button
                onClick={status === 'simulating' ? onStopSimulation : onStartSimulation}
                className="p-4 rounded-2xl bg-cyan-950/70 hover:bg-cyan-900/70 border border-cyan-500/30 text-cyan-300 font-bold text-xs transition-all flex flex-col items-center justify-center space-y-1.5 cursor-pointer"
              >
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <span>{status === 'simulating' ? 'Desativar Modo Simulação' : 'Ativar Simulador de Sensores'}</span>
                <span className="text-[10px] font-normal text-cyan-400/80">Testar app sem Arduino conectado</span>
              </button>
            </div>

            {status !== 'disconnected' && (
              <div className="flex justify-center pt-2">
                <button
                  onClick={onDisconnect}
                  className="flex items-center space-x-1 px-4 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 border border-slate-700 text-xs font-semibold text-slate-300 transition-all"
                >
                  <BluetoothOff className="w-3.5 h-3.5" />
                  <span>Desconectar / Parar</span>
                </button>
              </div>
            )}

            {/* Quick Tips */}
            <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/80 text-xs text-slate-400 space-y-1.5">
              <h5 className="font-bold text-slate-300 flex items-center space-x-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Instruções de Comunicação Serial / JSON</span>
              </h5>
              <p>
                O firmware do seu Arduino deve enviar linhas terminadas em <code className="text-emerald-400 font-mono">\n</code> com JSON:
              </p>
              <div className="p-2 rounded bg-slate-900 font-mono text-[11px] text-emerald-300">
                {"{\"m\": 45.2, \"t\": 24.5, \"l\": 580, \"adc\": 720}"}
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: Simulation Controls */}
        {activeTab === 'simulation' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center space-x-1.5">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Controles Manuais de Telemetria</span>
                </h4>
                <button
                  onClick={onStartSimulation}
                  className="text-[11px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/30"
                >
                  {status === 'simulating' ? '● Rodando' : 'Iniciar Simulação'}
                </button>
              </div>

              {/* Moisture Slider */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-emerald-400">Umidade do Solo:</span>
                  <span className="text-white font-bold">{sliderMoisture.toFixed(1)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.5"
                  value={sliderMoisture}
                  onChange={(e) => handleSliderChange(Number(e.target.value), sliderTemp, sliderLight)}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              {/* Temperature Slider */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-rose-400">Temperatura (°C):</span>
                  <span className="text-white font-bold">{sliderTemp.toFixed(1)}°C</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="45"
                  step="0.5"
                  value={sliderTemp}
                  onChange={(e) => handleSliderChange(sliderMoisture, Number(e.target.value), sliderLight)}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
              </div>

              {/* Light Slider */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-amber-400">Luminosidade (Lux):</span>
                  <span className="text-white font-bold">{sliderLight} lux</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1000"
                  step="10"
                  value={sliderLight}
                  onChange={(e) => handleSliderChange(sliderMoisture, sliderTemp, Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>

              {/* Fast drying toggle */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <div>
                  <div className="text-xs font-bold text-white">Secagem Rápida Acelerada</div>
                  <p className="text-[10px] text-slate-400">Diminui a umidade em 1% a cada 2s para testar alertas</p>
                </div>
                <input
                  type="checkbox"
                  checked={fastDrying}
                  onChange={handleToggleFastDry}
                  className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                />
              </div>

              {/* Instant Event Triggers */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={onSimulateWatering}
                  className="flex items-center justify-center space-x-1.5 py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all"
                >
                  <Droplet className="w-4 h-4 fill-current" />
                  <span>Simular Rega (88%) 💧</span>
                </button>

                <button
                  onClick={onSimulateDryOut}
                  className="flex items-center justify-center space-x-1.5 py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all"
                >
                  <Flame className="w-4 h-4" />
                  <span>Simular Sede Crítica (12%) 🥀</span>
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Tab 3: Serial Terminal Log */}
        {activeTab === 'terminal' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center space-x-1">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span>Console Serial RX/TX em Tempo Real</span>
              </span>
              <span className="text-[10px] font-mono">Baud: 115200 / 9600</span>
            </div>

            {/* Console window */}
            <div className="h-64 rounded-2xl bg-slate-950 border border-slate-800 p-3 font-mono text-[11px] overflow-y-auto space-y-1">
              {logs.length === 0 ? (
                <div className="text-slate-600 italic py-8 text-center">
                  Aguardando pacotes serial do Bluetooth ou do Simulador...
                </div>
              ) : (
                logs.map((l) => {
                  const time = new Date(l.timestamp).toLocaleTimeString();
                  return (
                    <div key={l.id} className="flex items-start space-x-2 leading-tight">
                      <span className="text-slate-600 shrink-0">[{time}]</span>
                      <span className={`shrink-0 uppercase font-bold text-[9px] px-1 rounded ${
                        l.type === 'rx'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : l.type === 'tx'
                          ? 'bg-sky-500/10 text-sky-400'
                          : l.type === 'error'
                          ? 'bg-rose-500/10 text-rose-400'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {l.type}
                      </span>
                      <span className={`break-all ${
                        l.type === 'rx'
                          ? 'text-emerald-300'
                          : l.type === 'tx'
                          ? 'text-sky-300 font-semibold'
                          : l.type === 'error'
                          ? 'text-rose-300'
                          : 'text-slate-400'
                      }`}>
                        {l.message}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={logsEndRef} />
            </div>

            {/* Send Command Input */}
            <div className="flex space-x-2">
              <input
                type="text"
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendCommand()}
                placeholder="Enviar comando serial (ex: STATUS, READ, CALIB)..."
                className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={handleSendCommand}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center space-x-1"
              >
                <Send className="w-3.5 h-3.5 text-emerald-400" />
                <span>Enviar</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
