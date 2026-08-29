export interface ArduinoCodePreset {
  id: string;
  title: string;
  hardware: string;
  description: string;
  baudRate: number;
  pinout: { pin: string; function: string; hardwarePin: string }[];
  code: string;
}

export const ARDUINO_PRESETS: ArduinoCodePreset[] = [
  {
    id: 'esp32-ble',
    title: 'ESP32 (BLE Nativo + Sensor Capacitivo + DHT11/22 + LDR)',
    hardware: 'ESP32 Dev Module / NodeMCU-32S',
    description: 'A solução mais moderna e recomendada. Usa o Bluetooth Low Energy (BLE) nativo do ESP32 com o protocolo Nordic UART para pareamento direto com o navegador via Web Bluetooth API.',
    baudRate: 115200,
    pinout: [
      { pin: 'GPIO 34 (ADC1)', function: 'Sensor de Umidade do Solo (AOUT)', hardwarePin: 'Sensor Capacitivo v1.2 / Resistivo' },
      { pin: 'GPIO 4', function: 'Sensor de Temperatura & Umidade DHT11 / DHT22', hardwarePin: 'Pino DATA do DHT' },
      { pin: 'GPIO 35 (ADC1)', function: 'Sensor de Luminosidade LDR', hardwarePin: 'Divisor de tensão LDR 10k' },
      { pin: '3V3 / GND', function: 'Alimentação dos sensores', hardwarePin: 'VCC / GND' },
    ],
    code: `/*
 * ==============================================================================
 * FLORA SENSE - MONITOR DE PLANTAS ARDUINO & TWITTER BOT
 * Firmware: ESP32 BLE (Bluetooth Low Energy) Nordic UART
 * ==============================================================================
 * Conecta diretamente ao navegador web via Web Bluetooth API!
 * Envia pacotes JSON a cada 2 segundos:
 * {"m": 45.2, "t": 24.5, "l": 580, "bat": 96, "adc": 650}
 * ==============================================================================
 */

#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>
#include <DHT.h>

// --- DEFINIÇÕES DE PINOS ---
#define SOIL_PIN        34   // Sensor de Umidade do Solo (Pino Analógico)
#define DHT_PIN         4    // Sensor DHT11 / DHT22 (Pino Digital)
#define LDR_PIN         35   // Sensor de Luminosidade LDR (Analógico)
#define STATUS_LED      2    // LED interno do ESP32

#define DHT_TYPE        DHT11 // Mude para DHT22 se estiver usando DHT22

// --- CALIBRAÇÃO DO SENSOR DE SOLO ---
// Ajuste estes valores de acordo com a calibração do seu sensor:
const int VALOR_SECO = 3100;   // Leitura analógica com sensor no ar seco (12-bit ADC)
const int VALOR_AGUA = 1200;   // Leitura analógica com sensor na água

// --- UUIDs NORDIC UART BLE (Padrão Web Bluetooth) ---
#define SERVICE_UUID           "6e400001-b5a3-f393-e0a9-e50e24dcca9e"
#define CHARACTERISTIC_UUID_RX "6e400002-b5a3-f393-e0a9-e50e24dcca9e"
#define CHARACTERISTIC_UUID_TX "6e400003-b5a3-f393-e0a9-e50e24dcca9e"

BLEServer *pServer = NULL;
BLECharacteristic *pTxCharacteristic;
bool deviceConnected = false;
bool oldDeviceConnected = false;

DHT dht(DHT_PIN, DHT_TYPE);

class MyServerCallbacks: public BLEServerCallbacks {
    void onConnect(BLEServer* pServer) {
      deviceConnected = true;
      digitalWrite(STATUS_LED, HIGH);
    };

    void onDisconnect(BLEServer* pServer) {
      deviceConnected = false;
      digitalWrite(STATUS_LED, LOW);
    }
};

void setup() {
  Serial.begin(115200);
  pinMode(STATUS_LED, OUTPUT);
  dht.begin();

  // Inicializa o BLE
  BLEDevice::init("FloraSense_ESP32");
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());

  BLEService *pService = pServer->createService(SERVICE_UUID);

  pTxCharacteristic = pService->createCharacteristic(
                        CHARACTERISTIC_UUID_TX,
                        BLECharacteristic::PROPERTY_NOTIFY
                      );
  pTxCharacteristic->addDescriptor(new BLE2902());

  BLECharacteristic *pRxCharacteristic = pService->createCharacteristic(
                                           CHARACTERISTIC_UUID_RX,
                                           BLECharacteristic::PROPERTY_WRITE
                                         );

  pService->start();

  // Inicia o Advertising
  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(true);
  pAdvertising->setMinPreferred(0x06);
  pAdvertising->setMinPreferred(0x12);
  BLEDevice::startAdvertising();

  Serial.println("🌿 FloraSense ESP32 BLE pronto! Aguardando conexão Bluetooth...");
}

void loop() {
  // 1. Leitura do Sensor de Solo
  int rawSoil = analogRead(SOIL_PIN);
  float moisture = map(rawSoil, VALOR_SECO, VALOR_AGUA, 0, 100);
  moisture = constrain(moisture, 0.0, 100.0);

  // 2. Leitura de Temperatura
  float temperature = dht.readTemperature();
  if (isnan(temperature)) {
    temperature = 24.0; // Fallback caso DHT desconectado
  }

  // 3. Leitura do LDR (Luz)
  int rawLdr = analogRead(LDR_PIN);
  int lightLux = map(rawLdr, 0, 4095, 0, 1000);

  // 4. Monta o pacote JSON
  String payload = "{\\"m\\":" + String(moisture, 1) + 
                   ",\\"t\\":" + String(temperature, 1) + 
                   ",\\"l\\":" + String(lightLux) + 
                   ",\\"bat\\":98" + 
                   ",\\"adc\\":" + String(rawSoil) + "}\\n";

  Serial.print("Telemetria: ");
  Serial.print(payload);

  // Se conectado via BLE, envia notificação
  if (deviceConnected) {
    pTxCharacteristic->setValue((uint8_t*)payload.c_str(), payload.length());
    pTxCharacteristic->notify();
  }

  // Reinicia o Advertising caso tenha desconectado
  if (!deviceConnected && oldDeviceConnected) {
    delay(500);
    pServer->startAdvertising();
    Serial.println("Reiniciando advertising BLE...");
    oldDeviceConnected = deviceConnected;
  }
  if (deviceConnected && !oldDeviceConnected) {
    oldDeviceConnected = deviceConnected;
  }

  delay(2000); // Envia telemetria a cada 2 segundos
}
`,
  },
  {
    id: 'arduino-hc05',
    title: 'Arduino Uno / Nano + Módulo Bluetooth HC-05 / HC-06',
    hardware: 'Arduino Uno, Nano, Pro Mini + Módulo HC-05 ou HC-06',
    description: 'Compatível com o clássico Arduino Uno e módulos Bluetooth SPP (Serial Port Profile). Envia dados formatados via SoftwareSerial.',
    baudRate: 9600,
    pinout: [
      { pin: 'A0', function: 'Sensor de Umidade do Solo (Analógico)', hardwarePin: 'AOUT do sensor' },
      { pin: 'D2', function: 'Sensor DHT11 (Pino de Dados)', hardwarePin: 'DATA do DHT' },
      { pin: 'D10 (RX)', function: 'Conectado ao TX do HC-05', hardwarePin: 'TX do Bluetooth' },
      { pin: 'D11 (TX)', function: 'Conectado ao RX do HC-05 (via divisor 1k/2k)', hardwarePin: 'RX do Bluetooth' },
    ],
    code: `/*
 * ==============================================================================
 * FLORA SENSE - MONITOR DE PLANTAS ARDUINO & TWITTER BOT
 * Firmware: Arduino Uno / Nano + Módulo HC-05 / HC-06 Serial Bluetooth
 * ==============================================================================
 */

#include <SoftwareSerial.h>
#include <DHT.h>

#define SOIL_PIN    A0
#define DHT_PIN     2
#define DHT_TYPE    DHT11

// Pinos de comunicação com o módulo Bluetooth HC-05
SoftwareSerial btSerial(10, 11); // RX = Pino 10, TX = Pino 11

DHT dht(DHT_PIN, DHT_TYPE);

const int VALOR_AR_SECO = 780;   // Leitura no ar
const int VALOR_NA_AGUA = 350;   // Leitura na água

void setup() {
  Serial.begin(9600);
  btSerial.begin(9600);
  dht.begin();
  
  Serial.println("FloraSense Arduino + HC-05 iniciado!");
  btSerial.println("FloraSense Pronto!");
}

void loop() {
  int rawSoil = analogRead(SOIL_PIN);
  float moisture = map(rawSoil, VALOR_AR_SECO, VALOR_NA_AGUA, 0, 100);
  moisture = constrain(moisture, 0.0, 100.0);

  float temp = dht.readTemperature();
  if (isnan(temp)) temp = 24.5;

  int light = analogRead(A1); // Opcional: LDR no pino A1
  int lightNorm = map(light, 0, 1023, 0, 1000);

  // Formata JSON compacto
  String json = "{\\"m\\":" + String(moisture, 1) + 
                ",\\"t\\":" + String(temp, 1) + 
                ",\\"l\\":" + String(lightNorm) + 
                ",\\"adc\\":" + String(rawSoil) + "}\\n";

  // Envia pela porta Serial USB (para monitor no PC)
  Serial.print(json);

  // Envia pelo Bluetooth para o aplicativo web / celular
  btSerial.print(json);

  delay(2000);
}
`,
  },
  {
    id: 'arduino-hm10',
    title: 'Arduino Uno / Nano + Módulo HM-10 (BLE 4.0)',
    hardware: 'Arduino Uno / Nano + HM-10 BLE 4.0 AT-09',
    description: 'HM-10 oferece suporte a Bluetooth Low Energy no Arduino padrão, permitindo conectar diretamente no navegador Google Chrome via Web Bluetooth API.',
    baudRate: 9600,
    pinout: [
      { pin: 'A0', function: 'Sensor de Umidade do Solo', hardwarePin: 'Sensor Capacitivo AOUT' },
      { pin: 'D2', function: 'Sensor DHT11 / DHT22', hardwarePin: 'Pino de Dados' },
      { pin: 'D8 (RX)', function: 'Conectado ao TX do HM-10', hardwarePin: 'TX do HM-10' },
      { pin: 'D9 (TX)', function: 'Conectado ao RX do HM-10', hardwarePin: 'RX do HM-10' },
    ],
    code: `/*
 * ==============================================================================
 * FLORA SENSE - ARDUINO + HM-10 BLE 4.0
 * Conexão direta com Web Bluetooth API (Service FFE0 / Char FFE1)
 * ==============================================================================
 */

#include <SoftwareSerial.h>
#include <DHT.h>

SoftwareSerial bleSerial(8, 9); // RX, TX
#define SOIL_PIN A0
#define DHT_PIN  2
DHT dht(DHT_PIN, DHT11);

void setup() {
  Serial.begin(9600);
  bleSerial.begin(9600);
  dht.begin();
  Serial.println("HM-10 BLE Iniciado!");
}

void loop() {
  int rawSoil = analogRead(SOIL_PIN);
  float moisture = map(rawSoil, 850, 380, 0, 100);
  moisture = constrain(moisture, 0.0, 100.0);

  float temp = dht.readTemperature();
  if (isnan(temp)) temp = 23.8;

  // Formata JSON
  String payload = "{\\"m\\":" + String(moisture, 1) + 
                   ",\\"t\\":" + String(temp, 1) + 
                   ",\\"l\\":500" + 
                   ",\\"adc\\":" + String(rawSoil) + "}\\n";

  Serial.print(payload);
  bleSerial.print(payload);

  delay(2000);
}
`,
  }
];
