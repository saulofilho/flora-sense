import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  Plus, 
  Bluetooth, 
  Sparkles, 
  Bell, 
  Droplet, 
  TrendingUp, 
  Twitter, 
  Layers,
  Settings2,
  Cpu,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Radio
} from 'lucide-react';

import { 
  Plant, 
  SensorReading, 
  TweetItem, 
  AlertLogItem, 
  BluetoothConnectionStatus, 
  BluetoothLogMessage,
  CalibrationSettings,
  PlantNotificationConfig
} from './types';

import { 
  loadStoredPlants, 
  saveStoredPlants, 
  loadStoredTweets, 
  saveStoredTweets, 
  loadStoredAlerts, 
  saveStoredAlerts 
} from './utils/storage';

import { bluetoothService } from './utils/bluetooth';
import { soundManager } from './utils/audio';
import { dispatchPlantAlert, requestNotificationPermission } from './utils/notifications';
import { generatePlantTweetText, sendTweetWebhook } from './utils/twitter';

import { Header } from './components/Header';
import { PlantCard } from './components/PlantCard';
import { PlantDetailView } from './components/PlantDetailView';
import { WeeklyHistoryChart } from './components/WeeklyHistoryChart';
import { TwitterBotPanel } from './components/TwitterBotPanel';
import { ThresholdSettingsModal } from './components/ThresholdSettingsModal';
import { BluetoothManagerModal } from './components/BluetoothManagerModal';
import { MultiPlantManager } from './components/MultiPlantManager';
import { ArduinoCodeGenerator } from './components/ArduinoCodeGenerator';
import { AlertsLogModal } from './components/AlertsLogModal';
import { GitHubPagesDocs } from './components/GitHubPagesDocs';

export default function App() {
  // State
  const [plants, setPlants] = useState<Plant[]>(loadStoredPlants);
  const [selectedPlantId, setSelectedPlantId] = useState<string>(() => plants[0]?.id || 'plant-monstera-1');
  const [tweets, setTweets] = useState<TweetItem[]>(loadStoredTweets);
  const [alerts, setAlerts] = useState<AlertLogItem[]>(loadStoredAlerts);

  // Bluetooth & Simulation
  const [bluetoothStatus, setBluetoothStatus] = useState<BluetoothConnectionStatus>('disconnected');
  const [bluetoothDeviceName, setBluetoothDeviceName] = useState<string | undefined>();
  const [bluetoothLogs, setBluetoothLogs] = useState<BluetoothLogMessage[]>([]);
  const [rollingReadings, setRollingReadings] = useState<SensorReading[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analytics' | 'twitter' | 'calibration'>('dashboard');

  // Modals
  const [isBluetoothModalOpen, setIsBluetoothModalOpen] = useState(false);
  const [isCalibrationModalOpen, setIsCalibrationModalOpen] = useState(false);
  const [isNewPlantModalOpen, setIsNewPlantModalOpen] = useState(false);
  const [isArduinoModalOpen, setIsArduinoModalOpen] = useState(false);
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false);
  const [isGitHubDocsOpen, setIsGitHubDocsOpen] = useState(false);

  // Active selected plant object
  const activePlant = plants.find((p) => p.id === selectedPlantId) || plants[0];

  // Ref for previous moisture to detect threshold crossing
  const prevMoistureRef = useRef<number>(activePlant?.currentReading.moisture || 50);

  // Save changes to localStorage
  useEffect(() => {
    saveStoredPlants(plants);
  }, [plants]);

  useEffect(() => {
    saveStoredTweets(tweets);
  }, [tweets]);

  useEffect(() => {
    saveStoredAlerts(alerts);
  }, [alerts]);

  // Handle incoming live sensor readings (from Bluetooth or Simulator)
  const handleNewSensorReading = useCallback((reading: SensorReading) => {
    setRollingReadings((prev) => [...prev.slice(-29), reading]);

    setPlants((prevPlants) => {
      return prevPlants.map((plant) => {
        if (plant.id !== selectedPlantId) return plant;

        const prevM = plant.currentReading.moisture;
        const newM = reading.moisture;
        const minThresh = plant.calibration.minMoistureThreshold;
        const critThresh = plant.calibration.criticalMoistureThreshold;

        // Check if crossed into Thirst or Critical
        const wasAboveMin = prevM > minThresh;
        const isNowBelowMin = newM <= minThresh;
        const isCritical = newM <= critThresh;

        // Auto Tweet & Alert trigger logic
        if (wasAboveMin && isNowBelowMin) {
          const now = Date.now();
          const lastTweetTime = plant.twitter.lastTweetTimestamp || 0;
          const cooldownMs = (plant.twitter.cooldownHours || 2) * 3600 * 1000;

          // 1. Dispatch Mobile & Sound Alert
          if (plant.notifications.enableMobilePush || plant.notifications.enableSoundAlerts) {
            dispatchPlantAlert({
              title: isCritical ? `🚨 ${plant.name}: Sede Crítica!` : `🥀 ${plant.name}: Precisa de Água!`,
              body: `A umidade caiu para ${newM.toFixed(1)}% (mínimo: ${minThresh}%). Regue em breve!`,
              plantId: plant.id,
            }, plant.notifications.enableSoundAlerts && soundEnabled);

            // Log Alert
            const newAlert: AlertLogItem = {
              id: `alert-${Date.now()}`,
              plantId: plant.id,
              plantName: plant.name,
              type: isCritical ? 'critical' : 'warning',
              title: isCritical ? `🚨 Umidade Crítica (${newM.toFixed(1)}%)` : `🥀 Alerta de Sede (${newM.toFixed(1)}%)`,
              message: `O sensor no solo detectou queda para ${newM.toFixed(1)}%. Limite configurado: ${minThresh}%.`,
              timestamp: now,
              moisture: newM,
              read: false,
            };
            setAlerts((a) => [newAlert, ...a]);
          }

          // 2. Auto Tweet on Thirst (if cooldown passed)
          if (plant.twitter.autoTweetOnThirst && (now - lastTweetTime > cooldownMs)) {
            const tweetText = generatePlantTweetText(plant, isCritical ? 'critical_thirst' : 'thirst_alert');
            const newTweet: TweetItem = {
              id: `tweet-${Date.now()}`,
              plantId: plant.id,
              plantName: plant.name,
              handle: plant.twitter.handle,
              content: tweetText,
              timestamp: now,
              likes: Math.floor(Math.random() * 8) + 1,
              retweets: Math.floor(Math.random() * 3),
              triggerReason: isCritical ? 'critical_thirst' : 'thirst_alert',
              postedToRealTwitter: true,
            };

            setTweets((t) => [newTweet, ...t]);

            // If webhook configured, fire webhook
            if (plant.twitter.webhookUrl) {
              sendTweetWebhook(plant.twitter.webhookUrl, {
                plantName: plant.name,
                handle: plant.twitter.handle,
                tweetText,
                moisture: newM,
                temperature: reading.temperature,
                timestamp: now,
              });
            }

            // Update last tweet timestamp on plant
            plant.twitter.lastTweetTimestamp = now;
          }
        }

        // Add to historical points periodically (every ~30s or on big jump)
        const updatedHistory = [...plant.history];
        const lastHist = updatedHistory[updatedHistory.length - 1];
        const now = Date.now();

        if (!lastHist || now - lastHist.timestamp > 30000) {
          const date = new Date(now);
          const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
          const dateStr = `${dayNames[date.getDay()]} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

          updatedHistory.push({
            timestamp: now,
            dateStr,
            moisture: newM,
            temperature: reading.temperature,
            light: reading.light,
            wasWatered: false,
          });

          // Keep history to last 150 points
          if (updatedHistory.length > 150) {
            updatedHistory.shift();
          }
        }

        return {
          ...plant,
          currentReading: reading,
          history: updatedHistory,
        };
      });
    });
  }, [selectedPlantId, soundEnabled]);

  // Setup Bluetooth callbacks
  useEffect(() => {
    bluetoothService.setCallbacks(
      handleNewSensorReading,
      (status, deviceName) => {
        setBluetoothStatus(status);
        if (deviceName) setBluetoothDeviceName(deviceName);
        setIsSimulating(status === 'simulating');
      },
      (log) => {
        setBluetoothLogs((prev) => [...prev.slice(-99), log]);
      }
    );
  }, [handleNewSensorReading]);

  // Request browser notification permission once
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  // Actions
  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundManager.setEnabled(next);
  };

  const handleToggleSimulation = () => {
    if (isSimulating) {
      bluetoothService.stopSimulation();
      setIsSimulating(false);
      setBluetoothStatus('disconnected');
    } else {
      bluetoothService.startSimulation(
        activePlant.currentReading.moisture,
        activePlant.currentReading.temperature,
        activePlant.currentReading.light
      );
      setIsSimulating(true);
      setBluetoothStatus('simulating');
    }
  };

  const handleWaterPlant = (plantId: string) => {
    // 1. Trigger confetti celebration
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#06b6d4', '#3b82f6', '#a7f3d0'],
      });
    } catch {
      // Ignore
    }

    // 2. Play water sound
    if (soundEnabled) {
      soundManager.playWaterDrop();
    }

    const now = Date.now();
    const wateredMoisture = 88.0;

    // Update simulation if active
    if (bluetoothStatus === 'simulating') {
      bluetoothService.simulateWatering(wateredMoisture);
    }

    setPlants((prev) =>
      prev.map((p) => {
        if (p.id !== plantId) return p;

        const updatedHistory = [...p.history];
        const date = new Date(now);
        const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        const dateStr = `${dayNames[date.getDay()]} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

        updatedHistory.push({
          timestamp: now,
          dateStr,
          moisture: wateredMoisture,
          temperature: Math.max(18, p.currentReading.temperature - 0.8),
          light: p.currentReading.light,
          wasWatered: true,
        });

        return {
          ...p,
          currentReading: {
            ...p.currentReading,
            moisture: wateredMoisture,
            rawAdc: 380,
            timestamp: now,
          },
          status: 'healthy',
          lastWateredTimestamp: now,
          history: updatedHistory,
        };
      })
    );

    // Auto tweet on watered
    const plant = plants.find((p) => p.id === plantId);
    if (plant && plant.twitter.autoTweetOnWatered) {
      const tweetText = generatePlantTweetText({
        ...plant,
        currentReading: { ...plant.currentReading, moisture: wateredMoisture }
      }, 'watered');

      const newTweet: TweetItem = {
        id: `tweet-${Date.now()}`,
        plantId: plant.id,
        plantName: plant.name,
        handle: plant.twitter.handle,
        content: tweetText,
        timestamp: now,
        likes: Math.floor(Math.random() * 15) + 5,
        retweets: Math.floor(Math.random() * 4) + 1,
        triggerReason: 'watered',
        postedToRealTwitter: true,
      };

      setTweets((t) => [newTweet, ...t]);

      // Alert log
      const newAlert: AlertLogItem = {
        id: `alert-${Date.now()}`,
        plantId: plant.id,
        plantName: plant.name,
        type: 'success',
        title: '💧 Planta Regada com Sucesso!',
        message: `${plant.name} foi hidratada. Umidade elevada para ${wateredMoisture}%.`,
        timestamp: now,
        moisture: wateredMoisture,
        read: true,
      };
      setAlerts((a) => [newAlert, ...a]);
    }
  };

  const handleSimulateDryOut = (plantId: string) => {
    const dryMoisture = 14.0;
    if (bluetoothStatus === 'simulating') {
      bluetoothService.simulateDryOut(dryMoisture);
    } else {
      bluetoothService.startSimulation(dryMoisture, 25.5, 750);
      setIsSimulating(true);
      setBluetoothStatus('simulating');
    }
  };

  const handleSaveCalibration = (
    plantId: string,
    calibration: CalibrationSettings,
    notifications: PlantNotificationConfig
  ) => {
    setPlants((prev) =>
      prev.map((p) => {
        if (p.id !== plantId) return p;
        return {
          ...p,
          calibration,
          notifications,
        };
      })
    );
  };

  const handleUpdatePlantTwitter = (plantId: string, updatedTwitter: Plant['twitter']) => {
    setPlants((prev) =>
      prev.map((p) => {
        if (p.id !== plantId) return p;
        return {
          ...p,
          twitter: updatedTwitter,
        };
      })
    );
  };

  const handlePostTweet = (
    plant: Plant,
    reason: 'thirst_alert' | 'critical_thirst' | 'watered' | 'manual',
    customText?: string
  ) => {
    const text = customText || generatePlantTweetText(plant, reason);
    const newTweet: TweetItem = {
      id: `tweet-${Date.now()}`,
      plantId: plant.id,
      plantName: plant.name,
      handle: plant.twitter.handle,
      content: text,
      timestamp: Date.now(),
      likes: 1,
      retweets: 0,
      triggerReason: reason,
      postedToRealTwitter: true,
    };

    setTweets((prev) => [newTweet, ...prev]);

    if (plant.twitter.webhookUrl) {
      sendTweetWebhook(plant.twitter.webhookUrl, {
        plantName: plant.name,
        handle: plant.twitter.handle,
        tweetText: text,
        moisture: plant.currentReading.moisture,
        temperature: plant.currentReading.temperature,
        timestamp: Date.now(),
      });
    }

    if (soundEnabled) {
      soundManager.playSuccess();
    }
  };

  const handleAddNewPlant = (newPlant: Plant) => {
    setPlants((prev) => [...prev, newPlant]);
    setSelectedPlantId(newPlant.id);
  };

  const unreadAlertsCount = alerts.filter((a) => !a.read).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-white pb-16">
      
      {/* Top Header */}
      <Header
        bluetoothStatus={bluetoothStatus}
        bluetoothDeviceName={bluetoothDeviceName}
        onOpenBluetoothModal={() => setIsBluetoothModalOpen(true)}
        onOpenNewPlantModal={() => setIsNewPlantModalOpen(true)}
        onOpenArduinoCodeModal={() => setIsArduinoModalOpen(true)}
        onOpenAlertsModal={() => setIsAlertsModalOpen(true)}
        onOpenGitHubDocsModal={() => setIsGitHubDocsOpen(true)}
        unreadAlertsCount={unreadAlertsCount}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        isSimulating={isSimulating}
        onToggleSimulation={handleToggleSimulation}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* Plant Selector Strip */}
        <div className="flex items-center justify-between gap-4 overflow-x-auto pb-2 scrollbar-none">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">
              Minhas Plantas ({plants.length}):
            </span>
            {plants.map((plant) => {
              const isSelected = plant.id === selectedPlantId;
              const isThirsty = plant.currentReading.moisture <= plant.calibration.minMoistureThreshold;
              const isCritical = plant.currentReading.moisture <= plant.calibration.criticalMoistureThreshold;

              return (
                <button
                  key={plant.id}
                  id={`btn-select-plant-${plant.id}`}
                  onClick={() => setSelectedPlantId(plant.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-2xl text-xs font-bold transition-all border shrink-0 ${
                    isSelected
                      ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-md shadow-emerald-950/40 ring-1 ring-emerald-500/50'
                      : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <span className="text-base">{plant.avatar || '🌿'}</span>
                  <span>{plant.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                    isCritical
                      ? 'bg-rose-500 text-white animate-pulse'
                      : isThirsty
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {Math.round(plant.currentReading.moisture)}%
                  </span>
                </button>
              );
            })}
          </div>

          <button
            id="btn-add-plant-strip"
            onClick={() => setIsNewPlantModalOpen(true)}
            className="flex items-center space-x-1 px-3 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-emerald-400 hover:text-emerald-300 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar</span>
          </button>
        </div>

        {/* Tab 1: Dashboard (Plant Details & Multiple Plants Grid) */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            
            {/* Selected Plant Detailed View */}
            {activePlant && (
              <PlantDetailView
                plant={activePlant}
                rollingReadings={rollingReadings}
                onWater={handleWaterPlant}
                onSimulateDryOut={handleSimulateDryOut}
                onOpenCalibration={(p) => {
                  setSelectedPlantId(p.id);
                  setIsCalibrationModalOpen(true);
                }}
                onOpenTwitter={(p) => {
                  setSelectedPlantId(p.id);
                  setActiveTab('twitter');
                }}
                onPostTweet={handlePostTweet}
                isSimulating={isSimulating}
              />
            )}

            {/* Multiple Plants Grid Overview */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight flex items-center space-x-2">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    <span>Visão Geral das Plantas Conectadas</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Acompanhamento simultâneo de múltiplos vasos e sensores de solo Bluetooth
                  </p>
                </div>

                <button
                  onClick={() => setIsNewPlantModalOpen(true)}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Cadastrar Planta</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {plants.map((plant) => (
                  <PlantCard
                    key={plant.id}
                    plant={plant}
                    isSelected={plant.id === selectedPlantId}
                    onSelect={(p) => setSelectedPlantId(p.id)}
                    onWater={handleWaterPlant}
                    onOpenCalibration={(p) => {
                      setSelectedPlantId(p.id);
                      setIsCalibrationModalOpen(true);
                    }}
                    onOpenTwitter={(p) => {
                      setSelectedPlantId(p.id);
                      setActiveTab('twitter');
                    }}
                  />
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: Analytics & Weekly History */}
        {activeTab === 'analytics' && activePlant && (
          <div className="space-y-6">
            <WeeklyHistoryChart plant={activePlant} />
          </div>
        )}

        {/* Tab 3: Twitter Bot Hub */}
        {activeTab === 'twitter' && activePlant && (
          <div className="space-y-6">
            <TwitterBotPanel
              plant={activePlant}
              tweets={tweets}
              onUpdatePlantTwitter={handleUpdatePlantTwitter}
              onPostTweet={handlePostTweet}
            />
          </div>
        )}

        {/* Tab 4: Calibration & Moisture Limits */}
        {activeTab === 'calibration' && activePlant && (
          <div className="space-y-6">
            <div className="rounded-3xl p-6 bg-slate-900 border border-slate-800 shadow-xl space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Calibração de Umidade & Limites: {activePlant.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Ajuste os parâmetros de seca, alerta sonoro, limites críticos e calibração analógica do conversor ADC
                  </p>
                </div>
                <button
                  onClick={() => setIsCalibrationModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all flex items-center space-x-1.5"
                >
                  <Settings2 className="w-4 h-4" />
                  <span>Abrir Assistente de Calibração</span>
                </button>
              </div>

              {/* Overview summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-amber-400 font-bold">Limite de Sede / Tweet</span>
                  <div className="text-2xl font-extrabold text-white mt-1">
                    {activePlant.calibration.minMoistureThreshold}%
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Dispara o tweet da planta e alerta celular
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-rose-400 font-bold">Limite Crítico</span>
                  <div className="text-2xl font-extrabold text-white mt-1">
                    {activePlant.calibration.criticalMoistureThreshold}%
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Alarme sonoro urgente de emergência
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-emerald-400 font-bold">Faixa Ideal</span>
                  <div className="text-2xl font-extrabold text-white mt-1">
                    {activePlant.calibration.idealMoistureRange[0]}% - {activePlant.calibration.idealMoistureRange[1]}%
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Zona de fotossíntese e crescimento ideal
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Modals */}
      <BluetoothManagerModal
        isOpen={isBluetoothModalOpen}
        onClose={() => setIsBluetoothModalOpen(false)}
        status={bluetoothStatus}
        deviceName={bluetoothDeviceName}
        logs={bluetoothLogs}
        currentReading={activePlant?.currentReading || { timestamp: Date.now(), moisture: 50, temperature: 24, light: 500 }}
        onConnectWebBluetooth={async () => {
          await bluetoothService.connect();
        }}
        onDisconnect={() => bluetoothService.disconnect()}
        onStartSimulation={() => {
          bluetoothService.startSimulation(activePlant.currentReading.moisture, activePlant.currentReading.temperature, activePlant.currentReading.light);
          setIsSimulating(true);
        }}
        onStopSimulation={() => {
          bluetoothService.stopSimulation();
          setIsSimulating(false);
        }}
        onSimulateWatering={() => handleWaterPlant(selectedPlantId)}
        onSimulateDryOut={() => handleSimulateDryOut(selectedPlantId)}
        onUpdateManualSliders={(m, t, l) => {
          bluetoothService.setManualSimulationValues(m, t, l);
        }}
        onToggleFastDrying={(fast) => bluetoothService.toggleFastDrying(fast)}
      />

      {activePlant && (
        <ThresholdSettingsModal
          plant={activePlant}
          isOpen={isCalibrationModalOpen}
          onClose={() => setIsCalibrationModalOpen(false)}
          onSave={handleSaveCalibration}
        />
      )}

      <MultiPlantManager
        isOpen={isNewPlantModalOpen}
        onClose={() => setIsNewPlantModalOpen(false)}
        onAddPlant={handleAddNewPlant}
      />

      <ArduinoCodeGenerator
        isOpen={isArduinoModalOpen}
        onClose={() => setIsArduinoModalOpen(false)}
      />

      <AlertsLogModal
        isOpen={isAlertsModalOpen}
        onClose={() => setIsAlertsModalOpen(false)}
        alerts={alerts}
        onClearAlerts={() => setAlerts([])}
        onMarkAllRead={() => setAlerts((prev) => prev.map((a) => ({ ...a, read: true })))}
      />

      <GitHubPagesDocs
        isOpen={isGitHubDocsOpen}
        onClose={() => setIsGitHubDocsOpen(false)}
      />

    </div>
  );
}
