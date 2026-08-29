import React from 'react';
import { 
  Bluetooth, 
  BluetoothConnected, 
  BluetoothOff, 
  Volume2, 
  VolumeX, 
  Bell, 
  Cpu, 
  BookOpen, 
  Plus, 
  Sparkles,
  RefreshCw,
  SlidersHorizontal
} from 'lucide-react';
import { BluetoothConnectionStatus } from '../types';

interface HeaderProps {
  bluetoothStatus: BluetoothConnectionStatus;
  bluetoothDeviceName?: string;
  onOpenBluetoothModal: () => void;
  onOpenNewPlantModal: () => void;
  onOpenArduinoCodeModal: () => void;
  onOpenAlertsModal: () => void;
  onOpenGitHubDocsModal: () => void;
  unreadAlertsCount: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  isSimulating: boolean;
  onToggleSimulation: () => void;
  activeTab: 'dashboard' | 'analytics' | 'twitter' | 'calibration';
  onSelectTab: (tab: 'dashboard' | 'analytics' | 'twitter' | 'calibration') => void;
}

export const Header: React.FC<HeaderProps> = ({
  bluetoothStatus,
  bluetoothDeviceName,
  onOpenBluetoothModal,
  onOpenNewPlantModal,
  onOpenArduinoCodeModal,
  onOpenAlertsModal,
  onOpenGitHubDocsModal,
  unreadAlertsCount,
  soundEnabled,
  onToggleSound,
  isSimulating,
  onToggleSimulation,
  activeTab,
  onSelectTab,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-950/40 text-2xl">
              🌿
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white font-['Outfit']">
                  Flora<span className="text-emerald-400">Sense</span>
                </span>
                <span className="hidden sm:inline-flex text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                  Arduino & Twitter IoT
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Monitoramento de Solo em Tempo Real via Bluetooth
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800/80">
            <button
              id="tab-btn-dashboard"
              onClick={() => onSelectTab('dashboard')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              🌱 Plantas & Telemetria
            </button>
            <button
              id="tab-btn-analytics"
              onClick={() => onSelectTab('analytics')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'analytics'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              📊 Histórico Semanal
            </button>
            <button
              id="tab-btn-twitter"
              onClick={() => onSelectTab('twitter')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'twitter'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              🐦 Twitter da Planta
            </button>
            <button
              id="tab-btn-calibration"
              onClick={() => onSelectTab('calibration')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'calibration'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              ⚙️ Calibração de Limites
            </button>
          </nav>

          {/* Quick Action Controls */}
          <div className="flex items-center space-x-2">
            
            {/* Bluetooth Quick Status / Connect button */}
            <button
              id="btn-bluetooth-connect"
              onClick={onOpenBluetoothModal}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                bluetoothStatus === 'connected'
                  ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300 shadow-sm shadow-emerald-500/20'
                  : bluetoothStatus === 'simulating'
                  ? 'bg-cyan-950/70 border-cyan-500/50 text-cyan-300'
                  : bluetoothStatus === 'connecting'
                  ? 'bg-amber-950/70 border-amber-500/50 text-amber-300 animate-pulse'
                  : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-300'
              }`}
              title="Gerenciar Conexão Bluetooth"
            >
              {bluetoothStatus === 'connected' ? (
                <>
                  <BluetoothConnected className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden lg:inline">{bluetoothDeviceName || 'Arduino Conectado'}</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                </>
              ) : bluetoothStatus === 'simulating' ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden lg:inline">Simulador Ativo</span>
                </>
              ) : bluetoothStatus === 'connecting' ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                  <span className="hidden lg:inline">Pareando...</span>
                </>
              ) : (
                <>
                  <Bluetooth className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden sm:inline">Conectar Arduino</span>
                </>
              )}
            </button>

            {/* Quick Simulation Toggle */}
            <button
              id="btn-toggle-simulation"
              onClick={onToggleSimulation}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                isSimulating
                  ? 'bg-cyan-900/40 border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/60'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
              }`}
              title={isSimulating ? 'Desativar modo simulação' : 'Ativar modo simulação com dados realistas'}
            >
              <span className="hidden xl:inline mr-1">Simulação:</span>
              <span className={isSimulating ? 'text-cyan-400 font-bold' : 'text-slate-400'}>
                {isSimulating ? 'ON' : 'OFF'}
              </span>
            </button>

            {/* Arduino Code Button */}
            <button
              id="btn-arduino-code"
              onClick={onOpenArduinoCodeModal}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 hover:text-white transition-all"
              title="Código Arduino (.ino) & Esquema de Ligação"
            >
              <Cpu className="w-4 h-4 text-emerald-400" />
            </button>

            {/* Alerts Notification Bell */}
            <button
              id="btn-alerts-log"
              onClick={onOpenAlertsModal}
              className="relative p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 hover:text-white transition-all"
              title="Histórico de Alertas e Notificações"
            >
              <Bell className="w-4 h-4" />
              {unreadAlertsCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-rose-500 text-white animate-bounce shadow-md">
                  {unreadAlertsCount}
                </span>
              )}
            </button>

            {/* Sound Toggle */}
            <button
              id="btn-sound-toggle"
              onClick={onToggleSound}
              className={`p-2 rounded-xl border transition-all ${
                soundEnabled
                  ? 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-slate-300'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
              title={soundEnabled ? 'Silenciar alertas sonoros' : 'Ativar alertas sonoros'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* GitHub Docs & README */}
            <button
              id="btn-github-docs"
              onClick={onOpenGitHubDocsModal}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 hover:text-white transition-all"
              title="README & Deploy GitHub Pages"
            >
              <BookOpen className="w-4 h-4 text-cyan-400" />
            </button>

            {/* Add Plant Button */}
            <button
              id="btn-add-plant-header"
              onClick={onOpenNewPlantModal}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Nova Planta</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-800/60 overflow-x-auto">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`px-3 py-1 text-xs font-medium rounded-lg whitespace-nowrap ${
              activeTab === 'dashboard' ? 'bg-emerald-600/30 text-emerald-300 font-bold' : 'text-slate-400'
            }`}
          >
            🌱 Plantas
          </button>
          <button
            onClick={() => onSelectTab('analytics')}
            className={`px-3 py-1 text-xs font-medium rounded-lg whitespace-nowrap ${
              activeTab === 'analytics' ? 'bg-emerald-600/30 text-emerald-300 font-bold' : 'text-slate-400'
            }`}
          >
            📊 Gráficos
          </button>
          <button
            onClick={() => onSelectTab('twitter')}
            className={`px-3 py-1 text-xs font-medium rounded-lg whitespace-nowrap ${
              activeTab === 'twitter' ? 'bg-emerald-600/30 text-emerald-300 font-bold' : 'text-slate-400'
            }`}
          >
            🐦 Twitter
          </button>
          <button
            onClick={() => onSelectTab('calibration')}
            className={`px-3 py-1 text-xs font-medium rounded-lg whitespace-nowrap ${
              activeTab === 'calibration' ? 'bg-emerald-600/30 text-emerald-300 font-bold' : 'text-slate-400'
            }`}
          >
            ⚙️ Limites
          </button>
        </div>

      </div>
    </header>
  );
};
