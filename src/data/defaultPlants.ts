import { Plant, HistoricalDataPoint } from '../types';

// Helper to generate 7 days of realistic historical points
function generate7DayHistory(baseMoisture: number, minThresh: number, daysAgo: number = 7): HistoricalDataPoint[] {
  const points: HistoricalDataPoint[] = [];
  const now = Date.now();
  const stepHours = 4; // every 4 hours for 7 days = 42 points
  const totalPoints = (daysAgo * 24) / stepHours;

  let currentM = 75; // start freshly watered
  let daysSinceWater = 0;

  for (let i = totalPoints; i >= 0; i--) {
    const timestamp = now - i * stepHours * 3600 * 1000;
    const date = new Date(timestamp);
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const dateStr = `${dayNames[date.getDay()]} ${String(date.getHours()).padStart(2, '0')}:00`;

    daysSinceWater += stepHours / 24;

    // Drying curve with diurnal oscillation
    const drying = (stepHours / 24) * 14; 
    currentM = Math.max(10, currentM - drying + (Math.random() - 0.5) * 2);

    let wasWatered = false;
    // Water if dropped too low around day 3 or 5
    if (currentM < minThresh - 2 || (i === 18 && currentM < 35)) {
      currentM = 85 + Math.random() * 8;
      wasWatered = true;
      daysSinceWater = 0;
    }

    const hour = date.getHours();
    const isDay = hour >= 6 && hour <= 18;
    const temperature = Number((21 + (isDay ? Math.sin((hour - 6) / 12 * Math.PI) * 6 : 0) + (Math.random() - 0.5) * 1.5).toFixed(1));
    const light = isDay ? Math.round(300 + Math.sin((hour - 6) / 12 * Math.PI) * 700 + (Math.random() - 0.5) * 80) : Math.round(10 + Math.random() * 20);

    points.push({
      timestamp,
      dateStr,
      moisture: Number(currentM.toFixed(1)),
      temperature,
      light,
      wasWatered,
    });
  }

  return points;
}

export const INITIAL_PLANTS: Plant[] = [
  {
    id: 'plant-monstera-1',
    name: 'Monstera da Sala',
    species: 'Monstera Deliciosa',
    location: 'Sala de Estar (Perto da Janela)',
    avatar: '🌿',
    color: '#10b981', // emerald
    createdAt: Date.now() - 14 * 86400000,
    bluetoothDeviceName: 'Arduino_Monstera_BLE',
    bluetoothConnected: false,
    currentReading: {
      timestamp: Date.now(),
      moisture: 28.5, // Currently thirsty to demonstrate tweet and alert!
      temperature: 24.2,
      light: 580,
      battery: 92,
      rawAdc: 780,
    },
    status: 'thirsty',
    lastWateredTimestamp: Date.now() - 3.5 * 86400000,
    calibration: {
      rawAirValue: 880,
      rawWaterValue: 390,
      minMoistureThreshold: 35,
      criticalMoistureThreshold: 18,
      maxMoistureThreshold: 85,
      idealMoistureRange: [40, 75],
    },
    twitter: {
      handle: 'MonsteraDramatica',
      displayName: 'Monstera Sofredora 🌱🥀',
      avatarEmoji: '🥀',
      bio: 'Sou uma Monstera Deliciosa que tuita toda vez que meu humano esquece de me regar. Salvem minhas folhas! #PlantTwitter',
      tone: 'dramatic',
      autoTweetOnThirst: true,
      autoTweetOnWatered: true,
      cooldownHours: 2,
      lastTweetTimestamp: Date.now() - 3600000 * 4,
    },
    notifications: {
      enableMobilePush: true,
      enableSoundAlerts: true,
      enableVibration: true,
      notifyOnCriticalThirst: true,
      notifyOnIdealRange: false,
      notifyOnWatered: true,
    },
    history: generate7DayHistory(28.5, 35),
  },
  {
    id: 'plant-samambaia-2',
    name: 'Samambaia da Varanda',
    species: 'Samambaia Americana',
    location: 'Varanda Gourmet',
    avatar: '🪴',
    color: '#06b6d4', // cyan
    createdAt: Date.now() - 30 * 86400000,
    bluetoothDeviceName: 'ESP32_Samambaia_BLE',
    bluetoothConnected: false,
    currentReading: {
      timestamp: Date.now(),
      moisture: 62.0,
      temperature: 22.8,
      light: 420,
      battery: 98,
      rawAdc: 490,
    },
    status: 'healthy',
    lastWateredTimestamp: Date.now() - 1.2 * 86400000,
    calibration: {
      rawAirValue: 920,
      rawWaterValue: 360,
      minMoistureThreshold: 45,
      criticalMoistureThreshold: 25,
      maxMoistureThreshold: 90,
      idealMoistureRange: [50, 80],
    },
    twitter: {
      handle: 'SamambaiaFofa',
      displayName: 'Samambaia Carinhosa 🌸',
      avatarEmoji: '🌿',
      bio: 'Adoro umidade no ar e borrifadas de água. Te lembro com muito carinho de cuidar do meu verde! ✨',
      tone: 'cute',
      autoTweetOnThirst: true,
      autoTweetOnWatered: true,
      cooldownHours: 3,
    },
    notifications: {
      enableMobilePush: true,
      enableSoundAlerts: true,
      enableVibration: true,
      notifyOnCriticalThirst: true,
      notifyOnIdealRange: false,
      notifyOnWatered: true,
    },
    history: generate7DayHistory(62, 45),
  },
  {
    id: 'plant-manjericao-3',
    name: 'Manjericão do Chef',
    species: 'Ocimum basilicum (Manjericão)',
    location: 'Bancada da Cozinha',
    avatar: '🌱',
    color: '#f59e0b', // amber
    createdAt: Date.now() - 10 * 86400000,
    bluetoothDeviceName: 'HC05_Manjericao_Serial',
    bluetoothConnected: false,
    currentReading: {
      timestamp: Date.now(),
      moisture: 14.2, // Critical thirst!
      temperature: 26.5,
      light: 890,
      battery: 85,
      rawAdc: 895,
    },
    status: 'critical',
    lastWateredTimestamp: Date.now() - 4.8 * 86400000,
    calibration: {
      rawAirValue: 900,
      rawWaterValue: 370,
      minMoistureThreshold: 30,
      criticalMoistureThreshold: 18,
      maxMoistureThreshold: 80,
      idealMoistureRange: [35, 70],
    },
    twitter: {
      handle: 'ManjericaoRebelde',
      displayName: 'Manjericão Sarcástico 🌵',
      avatarEmoji: '🤨',
      bio: 'Quer molho pesto mas esquece que planta bebe água? Tuíto verdades ácidas sobre os humanos que cuidam de mim.',
      tone: 'funny',
      autoTweetOnThirst: true,
      autoTweetOnWatered: true,
      cooldownHours: 1,
      lastTweetTimestamp: Date.now() - 1800000,
    },
    notifications: {
      enableMobilePush: true,
      enableSoundAlerts: true,
      enableVibration: true,
      notifyOnCriticalThirst: true,
      notifyOnIdealRange: true,
      notifyOnWatered: true,
    },
    history: generate7DayHistory(14.2, 30),
  },
  {
    id: 'plant-suculenta-4',
    name: 'Suculenta do Home Office',
    species: 'Echeveria Elegans',
    location: 'Mesa de Trabalho',
    avatar: '🌵',
    color: '#8b5cf6', // purple
    createdAt: Date.now() - 45 * 86400000,
    bluetoothDeviceName: 'ESP32_Echeveria_BLE',
    bluetoothConnected: false,
    currentReading: {
      timestamp: Date.now(),
      moisture: 38.0,
      temperature: 23.0,
      light: 650,
      battery: 99,
      rawAdc: 670,
    },
    status: 'healthy',
    lastWateredTimestamp: Date.now() - 8 * 86400000,
    calibration: {
      rawAirValue: 940,
      rawWaterValue: 410,
      minMoistureThreshold: 15,
      criticalMoistureThreshold: 8,
      maxMoistureThreshold: 60,
      idealMoistureRange: [20, 50],
    },
    twitter: {
      handle: 'SuculentaBot',
      displayName: 'Suculenta IoT Telemetry 🔬',
      avatarEmoji: '🤖',
      bio: 'Telemetria automatizada de umidade do substrato via Arduino & Web Bluetooth. Dados em tempo real.',
      tone: 'scientific',
      autoTweetOnThirst: true,
      autoTweetOnWatered: true,
      cooldownHours: 6,
    },
    notifications: {
      enableMobilePush: true,
      enableSoundAlerts: true,
      enableVibration: false,
      notifyOnCriticalThirst: true,
      notifyOnIdealRange: false,
      notifyOnWatered: true,
    },
    history: generate7DayHistory(38, 15),
  },
];
