# 🌿 FloraSense - Monitor de Plantas IoT via Arduino Bluetooth & Twitter Bot

[![React 19 + Vite](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev)
[![Web Bluetooth API](https://img.shields.io/badge/Web%20Bluetooth-Supported-brightgreen.svg)](https://caniuse.com/web-bluetooth)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)

**FloraSense** é uma aplicação web completa de Internet das Coisas (IoT) botânica. Ela conecta o navegador diretamente a placas **Arduino** ou **ESP32** via **Bluetooth (Web Bluetooth API)** para ler sensores de umidade do solo, temperatura e luminosidade em tempo real.

---

## ✨ Principais Funcionalidades

- **📡 Conexão Bluetooth Direta**: Pareamento instantâneo via Web Bluetooth (BLE Nordic UART ou HM-10/HC-05) direto pelo navegador Google Chrome / Edge / Android, sem instalar drivers.
- **🌱 Monitoramento Multi-Planta**: Suporte para múltiplas plantas simultâneas (Monstera, Samambaia, Manjericão, Suculenta, etc.), cada uma com calibração e identificador Bluetooth dedicados.
- **🐦 Twitter / X Bot com Personalidades**: Cada planta possui uma conta no Twitter com personalidade personalizável (*Dramática, Fofa, Científica, Humor Ácido*). Quando o solo seca, a planta publica tweets automáticos de sede pedindo rega!
- **🚨 Alertas no Celular & Alarme Sonoro**: Notificações push web, vibração no dispositivo móvel e avisos sonoros gerados por sintetizador Web Audio.
- **📊 Gráficos Históricos Semanais**: Curvas interativas de umidade e temperatura nos últimos 7 dias com marcação automática de eventos de rega.
- **⚙️ Assistente de Calibração de Sensores**: Calibre valores brutos do conversor analógico-digital (ADC no ar seco vs na água) para precisão de 0 a 100%.
- **💻 Gerador de Firmware Arduino (.ino)**: Códigos C++ prontos para ESP32 e Arduino Uno/Nano com esquemas de ligação e tabelas de pinagem.
- **🧪 Simulador Integrado**: Teste todas as funções, alertas e tweets sem precisar estar com o hardware físico conectado.

---

## 🛠️ Hardware Recomendado

1. **Placa**: ESP32 DevKit (Recomendado com BLE nativo) **ou** Arduino Uno / Nano + Módulo HC-05 / HM-10.
2. **Sensor de Umidade**: Sensor Capacitivo de Umidade de Solo v1.2 (resistente à oxidação).
3. **Sensor de Temperatura**: DHT11 ou DHT22.
4. **Sensor de Luz**: LDR (Resistor foto-sensível).

### 🔌 Tabela de Pinagem (ESP32)

| Componente | Pino do Sensor | Pino no ESP32 |
| :--- | :--- | :--- |
| **Sensor de Solo** | AOUT | GPIO 34 (ADC1) |
| **Sensor DHT11/22** | DATA | GPIO 4 |
| **Sensor LDR (Luz)** | Sinal | GPIO 35 (ADC1) |
| **Alimentação** | VCC / GND | 3V3 / GND |

---

## 🚀 Como Executar Localmente

\`\`\`bash
# Instalar dependências
npm install

# Rodar servidor de desenvolvimento
npm run dev

# Compilar para produção (gera pasta dist/)
npm run build
\`\`\`

---

## 🌐 Deploy no GitHub Pages

Este projeto é 100% estático e compatível com **GitHub Pages**:

1. Adicione a propriedade `"base": "./"` no `vite.config.ts`.
2. Execute `npm run build`.
3. Publique a pasta `dist` na branch `gh-pages` ou utilize a action automática `.github/workflows/deploy.yml`.

---

## 📄 Licença
Distribuído sob a licença MIT. Feito com amor para plantas bem hidratadas! 🌿💧
