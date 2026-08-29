import React, { useState } from 'react';
import { 
  Cpu, 
  Copy, 
  Check, 
  Download, 
  ExternalLink, 
  X, 
  HelpCircle, 
  Layers, 
  Radio, 
  Terminal,
  Zap
} from 'lucide-react';
import { ARDUINO_PRESETS, ArduinoCodePreset } from '../data/arduinoCode';

interface ArduinoCodeGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArduinoCodeGenerator: React.FC<ArduinoCodeGeneratorProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('esp32-ble');
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  const currentPreset = ARDUINO_PRESETS.find((p) => p.id === selectedPresetId) || ARDUINO_PRESETS[0];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentPreset.code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadIno = () => {
    const blob = new Blob([currentPreset.code], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FloraSense_${currentPreset.id.replace('-', '_')}.ino`;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                Gerador de Código Arduino / ESP32 (.ino) & Esquema de Ligação
              </h3>
              <p className="text-xs text-slate-400">
                Firmware pronto para compilar e carregar via Arduino IDE
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

        {/* Hardware Preset Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {ARDUINO_PRESETS.map((preset) => {
            const active = selectedPresetId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => setSelectedPresetId(preset.id)}
                className={`p-4 rounded-2xl text-left border transition-all ${
                  active
                    ? 'bg-emerald-950/60 border-emerald-500 text-white ring-1 ring-emerald-500/40 shadow-lg'
                    : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div className="text-xs font-bold text-white flex items-center justify-between">
                  <span>{preset.title.split('(')[0]}</span>
                  {active && <span className="text-emerald-400 text-xs">✓</span>}
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-1">
                  Baud: {preset.baudRate}
                </div>
                <p className="text-[11px] text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {preset.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Hardware Pinout Table */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5">
            <Zap className="w-3.5 h-3.5" />
            <span>Esquema de Pinagem & Conexões dos Sensores ({currentPreset.hardware})</span>
          </h4>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2 px-3">Pino na Placa</th>
                  <th className="py-2 px-3">Sensor / Função</th>
                  <th className="py-2 px-3">Hardware / Conexão</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900 text-slate-300 font-mono text-[11px]">
                {currentPreset.pinout.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-900/50">
                    <td className="py-2 px-3 text-emerald-400 font-bold">{row.pin}</td>
                    <td className="py-2 px-3">{row.function}</td>
                    <td className="py-2 px-3 text-slate-400">{row.hardwarePin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Code Block with Copy & Download */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 flex items-center space-x-1.5">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>Código C++ (.ino) Pronto para Arduino IDE</span>
            </span>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopyCode}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? 'Copiado!' : 'Copiar Código'}</span>
              </button>

              <button
                onClick={handleDownloadIno}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Baixar .ino</span>
              </button>
            </div>
          </div>

          <div className="h-72 rounded-2xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs text-slate-300 overflow-y-auto leading-relaxed select-all">
            <pre>{currentPreset.code}</pre>
          </div>
        </div>

        {/* Step by step guide */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400 space-y-1.5">
          <h5 className="font-bold text-slate-200 flex items-center space-x-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Como Gravar no seu Arduino / ESP32:</span>
          </h5>
          <ol className="list-decimal list-inside space-y-1 text-slate-400 pl-1">
            <li>Abra a <strong>Arduino IDE</strong> (versão 2.0+ recomendada).</li>
            <li>Instale as bibliotecas <code>DHT sensor library</code> e <code>Adafruit Unified Sensor</code> no Gerenciador de Bibliotecas.</li>
            <li>Selecione sua placa (ex: <em>ESP32 Dev Module</em> ou <em>Arduino Uno</em>) e a porta COM.</li>
            <li>Cole o código acima e clique no botão <strong>Carregar (Upload) ➔</strong>.</li>
            <li>Volte a este aplicativo web e clique em <strong>"Buscar & Parear Dispositivo Bluetooth"</strong> para ver os dados fluindo em tempo real!</li>
          </ol>
        </div>

      </div>
    </div>
  );
};
