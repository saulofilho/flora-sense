import { BluetoothConnectionStatus, BluetoothLogMessage, SensorReading } from '../types';

// Standard Nordic UART BLE UUIDs
export const NORDIC_UART_SERVICE = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
export const NORDIC_UART_TX = '6e400003-b5a3-f393-e0a9-e50e24dcca9e'; // Plant -> App (Notify)
export const NORDIC_UART_RX = '6e400002-b5a3-f393-e0a9-e50e24dcca9e'; // App -> Plant (Write)

// HM-10 BLE UUIDs
export const HM10_SERVICE = '0000ffe0-0000-1000-8000-00805f9b34fb';
export const HM10_CHAR = '0000ffe1-0000-1000-8000-00805f9b34fb';

export class BluetoothManager {
  private device: any | null = null;
  private server: any | null = null;
  private characteristic: any | null = null;
  private writeCharacteristic: any | null = null;
  private status: BluetoothConnectionStatus = 'disconnected';
  private buffer: string = '';
  private onReadingCallback: ((reading: SensorReading) => void) | null = null;
  private onStatusChangeCallback: ((status: BluetoothConnectionStatus, deviceName?: string) => void) | null = null;
  private onLogCallback: ((log: BluetoothLogMessage) => void) | null = null;
  
  // Simulator state
  private simulationInterval: number | null = null;
  private simMoisture: number = 48;
  private simTemp: number = 23.5;
  private simLight: number = 420;
  private isDryingFast: boolean = false;

  constructor() {
    // Initial state
  }

  public isWebBluetoothSupported(): boolean {
    return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
  }

  public getStatus(): BluetoothConnectionStatus {
    return this.status;
  }

  public setCallbacks(
    onReading: (reading: SensorReading) => void,
    onStatusChange: (status: BluetoothConnectionStatus, deviceName?: string) => void,
    onLog: (log: BluetoothLogMessage) => void
  ) {
    this.onReadingCallback = onReading;
    this.onStatusChangeCallback = onStatusChange;
    this.onLogCallback = onLog;
  }

  private log(type: 'rx' | 'tx' | 'info' | 'error', message: string) {
    if (this.onLogCallback) {
      this.onLogCallback({
        id: Math.random().toString(36).substring(2, 9),
        timestamp: Date.now(),
        type,
        message,
      });
    }
  }

  private setStatus(status: BluetoothConnectionStatus, deviceName?: string) {
    this.status = status;
    if (this.onStatusChangeCallback) {
      this.onStatusChangeCallback(status, deviceName);
    }
  }

  /**
   * Request and connect to an Arduino Bluetooth device (BLE)
   */
  public async connect(): Promise<boolean> {
    if (!this.isWebBluetoothSupported()) {
      this.log('error', 'Web Bluetooth API não é suportada neste navegador.');
      return false;
    }

    try {
      this.setStatus('connecting');
      this.log('info', 'Buscando dispositivos Bluetooth Arduino (HC-05/HM-10/ESP32)...');

      // Request device with common IoT UUIDs or acceptAllDevices
      const navAny = navigator as any;
      const device = await navAny.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [
          NORDIC_UART_SERVICE,
          HM10_SERVICE,
          'generic_access',
          'battery_service',
          '0000180a-0000-1000-8000-00805f9b34fb', // Device Info
        ],
      });

      this.device = device;
      this.log('info', `Dispositivo selecionado: ${device.name || 'Dispositivo sem nome'} (ID: ${device.id})`);

      device.addEventListener('gattserverdisconnected', this.onDisconnected.bind(this));

      this.log('info', 'Conectando ao GATT Server...');
      const server = await device.gatt.connect();
      this.server = server;

      // Try Nordic UART first
      let service: any;
      let rxChar: any;
      let txChar: any;

      try {
        service = await server.getPrimaryService(NORDIC_UART_SERVICE);
        txChar = await service.getCharacteristic(NORDIC_UART_TX);
        try {
          rxChar = await service.getCharacteristic(NORDIC_UART_RX);
        } catch {
          // write char optional
        }
      } catch {
        // Try HM-10
        try {
          service = await server.getPrimaryService(HM10_SERVICE);
          txChar = await service.getCharacteristic(HM10_CHAR);
          rxChar = txChar;
        } catch {
          this.log('info', 'Tentando buscar serviços genéricos do dispositivo...');
          const services = await server.getPrimaryServices();
          if (services.length > 0) {
            for (const s of services) {
              const chars = await s.getCharacteristics();
              for (const c of chars) {
                if (c.properties.notify || c.properties.indicate) {
                  txChar = c;
                  break;
                }
              }
              if (txChar) break;
            }
          }
        }
      }

      if (!txChar) {
        throw new Error('Nenhuma característica de notificação/dados serial encontrada no dispositivo.');
      }

      this.characteristic = txChar;
      this.writeCharacteristic = rxChar || null;

      await txChar.startNotifications();
      txChar.addEventListener('characteristicvaluechanged', this.handleDataNotification.bind(this));

      this.setStatus('connected', device.name || 'Arduino Bluetooth');
      this.log('info', `Conectado com sucesso ao Arduino! Recebendo telemetria.`);
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.log('error', `Erro na conexão Bluetooth: ${msg}`);
      this.setStatus('disconnected');
      return false;
    }
  }

  private handleDataNotification(event: any) {
    const value = event.target.value;
    const decoder = new TextDecoder('utf-8');
    const textChunk = decoder.decode(value);
    
    this.buffer += textChunk;
    
    // Process full lines
    const lines = this.buffer.split('\n');
    this.buffer = lines.pop() || ''; // Keep incomplete part

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.length > 0) {
        this.log('rx', trimmed);
        this.parseIncomingLine(trimmed);
      }
    }
  }

  /**
   * Parses JSON, CSV, or Key-Value format from Arduino
   * Examples:
   * JSON: {"m": 45, "t": 24.2, "l": 550, "bat": 90}
   * CSV: 45,24.2,550
   * KV: M:45,T:24.2,L:550
   */
  public parseIncomingLine(line: string) {
    try {
      // 1. Check if JSON
      if (line.startsWith('{') && line.endsWith('}')) {
        const data = JSON.parse(line);
        const moisture = data.m !== undefined ? Number(data.m) : (data.moisture !== undefined ? Number(data.moisture) : 50);
        const temperature = data.t !== undefined ? Number(data.t) : (data.temp !== undefined ? Number(data.temp) : 24);
        const light = data.l !== undefined ? Number(data.l) : (data.light !== undefined ? Number(data.light) : 500);
        const battery = data.bat !== undefined ? Number(data.bat) : (data.battery !== undefined ? Number(data.battery) : 95);
        const rawAdc = data.adc !== undefined ? Number(data.adc) : undefined;

        this.dispatchReading({
          timestamp: Date.now(),
          moisture: Math.max(0, Math.min(100, moisture)),
          temperature,
          light,
          battery,
          rawAdc,
        });
        return;
      }

      // 2. Check Key-Value: "M:45,T:24.2,L:550"
      if (line.includes(':')) {
        const parts = line.split(',');
        let m = 50, t = 24, l = 500, bat = 95, adc: number | undefined;

        for (const part of parts) {
          const [key, val] = part.split(':');
          if (!key || val === undefined) continue;
          const k = key.trim().toUpperCase();
          const v = parseFloat(val.trim());
          if (isNaN(v)) continue;

          if (k === 'M' || k === 'MOISTURE' || k === 'HUMIDADE' || k === 'UMIDADE') m = v;
          else if (k === 'T' || k === 'TEMP' || k === 'TEMPERATURA') t = v;
          else if (k === 'L' || k === 'LIGHT' || k === 'LUZ' || k === 'LDR') l = v;
          else if (k === 'BAT' || k === 'BATTERY' || k === 'B') bat = v;
          else if (k === 'ADC' || k === 'RAW') adc = v;
        }

        this.dispatchReading({
          timestamp: Date.now(),
          moisture: Math.max(0, Math.min(100, m)),
          temperature: t,
          light: l,
          battery: bat,
          rawAdc: adc,
        });
        return;
      }

      // 3. Check CSV: "45,24.2,500"
      if (line.includes(',')) {
        const parts = line.split(',').map((p) => parseFloat(p.trim()));
        if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
          this.dispatchReading({
            timestamp: Date.now(),
            moisture: Math.max(0, Math.min(100, parts[0])),
            temperature: parts[1],
            light: parts[2] !== undefined && !isNaN(parts[2]) ? parts[2] : 450,
            battery: parts[3] !== undefined && !isNaN(parts[3]) ? parts[3] : 95,
          });
          return;
        }
      }

      // 4. Single number: Moisture %
      const singleNum = parseFloat(line);
      if (!isNaN(singleNum)) {
        this.dispatchReading({
          timestamp: Date.now(),
          moisture: Math.max(0, Math.min(100, singleNum)),
          temperature: 24.5,
          light: 480,
          battery: 95,
        });
      }
    } catch (err) {
      console.warn('Erro ao decodificar linha serial:', line, err);
    }
  }

  private dispatchReading(reading: SensorReading) {
    if (this.onReadingCallback) {
      this.onReadingCallback(reading);
    }
  }

  public async sendCommand(cmd: string): Promise<boolean> {
    if (!this.writeCharacteristic) {
      this.log('error', 'Dispositivo não suporta envio de comandos de escrita.');
      return false;
    }

    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(cmd + '\n');
      await this.writeCharacteristic.writeValue(data);
      this.log('tx', cmd);
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.log('error', `Falha ao enviar comando: ${msg}`);
      return false;
    }
  }

  public disconnect() {
    this.stopSimulation();
    if (this.device && this.device.gatt.connected) {
      this.device.gatt.disconnect();
    }
    this.setStatus('disconnected');
    this.log('info', 'Bluetooth desconectado.');
  }

  private onDisconnected() {
    this.setStatus('disconnected');
    this.log('info', 'Dispositivo Bluetooth foi desconectado.');
  }

  // ==================== SIMULATOR MODE ====================

  public startSimulation(initialMoisture: number = 45, initialTemp: number = 24.0, initialLight: number = 520) {
    this.disconnect();
    this.simMoisture = initialMoisture;
    this.simTemp = initialTemp;
    this.simLight = initialLight;

    this.setStatus('simulating', 'Simulador Arduino BLE');
    this.log('info', 'Modo Simulação ativado. Gerando telemetria em tempo real.');

    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
    }

    this.simulationInterval = window.setInterval(() => {
      // Natural slow soil drying or fast drying
      const dryingRate = this.isDryingFast ? (0.6 + Math.random() * 0.4) : (0.05 + Math.random() * 0.05);
      this.simMoisture = Math.max(5, this.simMoisture - dryingRate);

      // Temperature variation with slight noise
      const tempDelta = (Math.random() - 0.5) * 0.2;
      this.simTemp = Number((this.simTemp + tempDelta).toFixed(1));

      // Light fluctuation
      const lightDelta = Math.floor((Math.random() - 0.5) * 20);
      this.simLight = Math.max(50, Math.min(1200, this.simLight + lightDelta));

      const rawAdc = Math.round(950 - (this.simMoisture / 100) * 550);

      const reading: SensorReading = {
        timestamp: Date.now(),
        moisture: Number(this.simMoisture.toFixed(1)),
        temperature: this.simTemp,
        light: this.simLight,
        battery: 94,
        rawAdc,
      };

      this.log('rx', `[SIM] {"m":${reading.moisture},"t":${reading.temperature},"l":${reading.light},"adc":${rawAdc}}`);
      this.dispatchReading(reading);
    }, 2000);
  }

  public stopSimulation() {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
  }

  public simulateWatering(newMoisture: number = 88) {
    this.simMoisture = newMoisture;
    this.log('info', `💦 Evento de Rega Simulado! Umidade subiu para ${newMoisture}%`);
    if (this.status === 'simulating') {
      const reading: SensorReading = {
        timestamp: Date.now(),
        moisture: this.simMoisture,
        temperature: Number((this.simTemp - 0.8).toFixed(1)), // Water cools soil
        light: this.simLight,
        battery: 94,
        rawAdc: 380,
      };
      this.dispatchReading(reading);
    }
  }

  public simulateDryOut(dryMoisture: number = 14) {
    this.simMoisture = dryMoisture;
    this.log('info', `⚠️ Solo Seco Simulado! Umidade caiu para ${dryMoisture}%`);
    if (this.status === 'simulating') {
      const reading: SensorReading = {
        timestamp: Date.now(),
        moisture: this.simMoisture,
        temperature: Number((this.simTemp + 1.2).toFixed(1)),
        light: this.simLight,
        battery: 94,
        rawAdc: 890,
      };
      this.dispatchReading(reading);
    }
  }

  public setManualSimulationValues(m: number, t: number, l: number) {
    this.simMoisture = m;
    this.simTemp = t;
    this.simLight = l;
    if (this.status === 'simulating') {
      const reading: SensorReading = {
        timestamp: Date.now(),
        moisture: this.simMoisture,
        temperature: this.simTemp,
        light: this.simLight,
        battery: 94,
        rawAdc: Math.round(950 - (this.simMoisture / 100) * 550),
      };
      this.dispatchReading(reading);
    }
  }

  public toggleFastDrying(fast: boolean) {
    this.isDryingFast = fast;
    this.log('info', `Secagem rápida: ${fast ? 'ATIVADA (demonstração rápida de sede)' : 'DESATIVADA'}`);
  }
}

export const bluetoothService = new BluetoothManager();
