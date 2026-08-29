export type PlantStatus = 'healthy' | 'warning' | 'thirsty' | 'critical' | 'waterlogged' | 'offline';

export type PlantTone = 'dramatic' | 'cute' | 'scientific' | 'funny' | 'custom';

export interface SensorReading {
  timestamp: number;
  moisture: number; // 0 to 100%
  temperature: number; // in Celsius
  light: number; // in Lux or 0-100%
  conductivity?: number; // uS/cm
  battery?: number; // 0 to 100%
  rawAdc?: number; // 0 to 1023
}

export interface HistoricalDataPoint {
  timestamp: number;
  dateStr: string; // e.g. "Seg 14:00" or "2025-05-10"
  moisture: number;
  temperature: number;
  light: number;
  wasWatered?: boolean;
}

export interface CalibrationSettings {
  rawAirValue: number; // Reading in dry air (e.g. 850-1023)
  rawWaterValue: number; // Reading in full water (e.g. 350-450)
  minMoistureThreshold: number; // Alert threshold e.g. 30%
  criticalMoistureThreshold: number; // High critical alert e.g. 15%
  maxMoistureThreshold: number; // Over-watering threshold e.g. 85%
  idealMoistureRange: [number, number]; // e.g. [40, 75]
}

export interface TwitterConfig {
  handle: string;
  displayName: string;
  avatarEmoji: string;
  bio: string;
  tone: PlantTone;
  customTemplate?: string;
  autoTweetOnThirst: boolean;
  autoTweetOnWatered: boolean;
  cooldownHours: number; // Prevent spamming, e.g. 2 hours
  lastTweetTimestamp?: number;
  webhookUrl?: string; // Optional webhook (Make/Zapier/Discord/N8N)
  bearerToken?: string; // Optional direct X API key
}

export interface PlantNotificationConfig {
  enableMobilePush: boolean;
  enableSoundAlerts: boolean;
  enableVibration: boolean;
  notifyOnCriticalThirst: boolean;
  notifyOnIdealRange: boolean;
  notifyOnWatered: boolean;
}

export interface TweetItem {
  id: string;
  plantId: string;
  plantName: string;
  handle: string;
  content: string;
  timestamp: number;
  likes: number;
  retweets: number;
  triggerReason: 'thirst_alert' | 'critical_thirst' | 'watered' | 'manual' | 'daily_update';
  postedToRealTwitter?: boolean;
}

export interface AlertLogItem {
  id: string;
  plantId: string;
  plantName: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: number;
  moisture: number;
  read: boolean;
}

export interface Plant {
  id: string;
  name: string;
  species: string;
  location: string;
  avatar: string; // Emoji or image URL
  color: string; // Accent color hex or tailwind class
  createdAt: number;
  
  // Bluetooth configuration
  bluetoothDeviceId?: string;
  bluetoothDeviceName?: string;
  bluetoothConnected: boolean;
  
  // Current live telemetry
  currentReading: SensorReading;
  status: PlantStatus;
  lastWateredTimestamp: number;
  
  // Configuration
  calibration: CalibrationSettings;
  twitter: TwitterConfig;
  notifications: PlantNotificationConfig;
  
  // Historical data
  history: HistoricalDataPoint[];
}

export type BluetoothConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error' | 'simulating';

export interface BluetoothLogMessage {
  id: string;
  timestamp: number;
  type: 'rx' | 'tx' | 'info' | 'error';
  message: string;
}
