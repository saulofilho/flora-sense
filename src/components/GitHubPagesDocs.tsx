import React, { useState } from 'react';
import { 
  BookOpen, 
  Copy, 
  Check, 
  Download, 
  ExternalLink, 
  X, 
  Github, 
  Globe, 
  Terminal, 
  CheckCircle2
} from 'lucide-react';

interface GitHubPagesDocsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GITHUB_README_CONTENT = `# 🌿 FloraSense - Monitor de Plantas IoT via Arduino Bluetooth & Twitter Bot

[![Deploy to GitHub Pages](https://github.com/actions/workflows/deploy.yml/badge.svg)](https://github.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![React 19 + Vite](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev)
[![Web Bluetooth API](https://img.shields.io/badge/Web%20Bluetooth-Supported-brightgreen.svg)](https://caniuse.com/web-bluetooth)

**FloraSense** é uma aplicação completa de Internet das Coisas (IoT) botânica. Ela conecta o navegador diretamente a placas **Arduino** ou **ESP32** via **Bluetooth (Web Bluetooth API)** para ler sensores de umidade do solo, temperatura e luminosidade em tempo real.

Quando o solo seca e o nível hídrico cai abaixo do limite programado:
1. 📲 Dispara alertas sonoros, vibração e notificações push no celular/computador.
2. 🐦 Conecta à conta no Twitter/X da planta e publica tweets automáticos e bem-humorados pedindo água com diferentes personalidades (Dramática, Fofa, Científica, Humor Ácido).
3. 📊 Registra gráficos históricos semanais de telemetria e ciclos de rega.
4. 🌿 Suporta múltiplas plantas simultâneas, cada uma com limites, calibração e perfis de Twitter independentes.

---

## 🚀 Demonstração no GitHub Pages

Para publicar este projeto gratuitamente no **GitHub Pages**:

\`\`\`bash
# 1. Clone o repositório
git clone https://github.com/SEU_USUARIO/florasense-arduino-bluetooth.git
cd florasense-arduino-bluetooth

# 2. Instale as dependências
npm install

# 3. Compile a versão estática de produção
npm run build

# 4. Deploy no GitHub Pages
npm run deploy
\`\`\`

---

## 🛠️ Hardware Necessário

- **Microcontrolador**: ESP32 DevKit (Recomendado - possui BLE nativo) **OU** Arduino Uno / Nano + Módulo Bluetooth HC-05 / HC-06 / HM-10.
- **Sensor de Umidade do Solo**: Sensor Capacitivo de Umidade v1.2 (resistente à corrosão) ou Sensor Resistivo.
- **Sensor de Temperatura/Umidade do Ar**: DHT11 ou DHT22.
- **Sensor de Luz**: LDR (Resistor dependente de luz) + resistor 10kΩ.
- **Cabos Jumpers & Protoboard**.

### 🔌 Esquema de Ligação (Pinout ESP32)

| Componente | Pino do Sensor | Pino no ESP32 |
| :--- | :--- | :--- |
| **Sensor de Solo** | AOUT | GPIO 34 (ADC1) |
| **Sensor DHT11/22** | DATA | GPIO 4 |
| **Sensor LDR (Luz)** | Sinal | GPIO 35 (ADC1) |
| **Alimentação** | VCC / GND | 3V3 / GND |

---

## 📡 Protocolo Serial / Bluetooth BLE

O Arduino/ESP32 envia a telemetria em formato JSON compactado a cada 2 segundos pela característica Nordic UART (\`6E400003-B5A3-F393-E0A9-E50E24DCCA9E\`):

\`\`\`json
{"m": 45.2, "t": 24.5, "l": 580, "bat": 98, "adc": 720}
\`\`\`

- \`m\`: Umidade do solo (0 a 100%)
- \`t\`: Temperatura (°C)
- \`l\`: Luminosidade (Lux)
- \`bat\`: Bateria (%)
- \`adc\`: Leitura analógica bruta para calibração

---

## 🐦 Twitter / X Bot das Plantas

O sistema oferece 5 personalidades dinâmicas:
- **🥀 Dramática**: "SOCORRO! O solo secou e sinto minhas folhas murchando... Alguém traga água! (Umidade: 22%)"
- **🌱 Fofa & Carinhosa**: "Oie mamãe/papai! Minhas raízes tão pedindo uma chuvinha gostosa... Me dá um golinho de água? 🥰"
- **📊 Científica & Robótica**: "[TELEMETRIA ARDUINO] Alerta de Déficit Hídrico: Umidade em 18% <= Limite Crítico."
- **🌵 Humor Ácido**: "Você comprou uma planta achando que ela bebia ar e luz? Estou com 14% de umidade. 🙄"
- **✏️ Personalizada**: Crie seus próprios templates com as variáveis \`{name}\`, \`{moisture}%\`, \`{temp}°C\`.

Também suporta Webhooks para automação no **Make / Integromat / Zapier / Discord**.

---

## 📄 Licença
Distribuído sob a licença MIT. Criado para amantes da botânica e automação IoT!
`;

export const GITHUB_ACTIONS_WORKFLOW = `name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main
      - master
  workflow_dispatch:

permissions:
  contents: write
  pages: write
  id-token: write

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install Dependencies
        run: npm install

      - name: Build Static Applet
        run: npm run build

      - name: Deploy to gh-pages branch
        uses: JamesIves/github-pages-deploy-action@v4
        with:
          folder: dist
          branch: gh-pages

      - name: Setup GitHub Pages (Actions mode)
        uses: actions/configure-pages@v5
        continue-on-error: true

      - name: Upload Pages Artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist
        continue-on-error: true

      - name: Deploy to GitHub Pages (Actions mode)
        id: deployment
        uses: actions/deploy-pages@v4
        continue-on-error: true
`;

export const GitHubPagesDocs: React.FC<GitHubPagesDocsProps> = ({ isOpen, onClose }) => {
  const [copiedType, setCopiedType] = useState<'readme' | 'workflow' | null>(null);

  if (!isOpen) return null;

  const handleCopyReadme = () => {
    navigator.clipboard.writeText(GITHUB_README_CONTENT);
    setCopiedType('readme');
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleCopyWorkflow = () => {
    navigator.clipboard.writeText(GITHUB_ACTIONS_WORKFLOW);
    setCopiedType('workflow');
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleDownloadReadme = () => {
    const blob = new Blob([GITHUB_README_CONTENT], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'README.md';
    link.click();
  };

  const handleDownloadWorkflow = () => {
    const blob = new Blob([GITHUB_ACTIONS_WORKFLOW], { type: 'text/yaml;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'deploy.yml';
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                Documentação GitHub & Versão GitHub Pages
              </h3>
              <p className="text-xs text-slate-400">
                README.md completo para seu repositório e workflow de deploy contínuo
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

        {/* Quick Instructions Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400">
              <Globe className="w-4 h-4" />
              <span>Publicação no GitHub Pages</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              O projeto é 100% estático (Vite SPA com Web Bluetooth). Pode ser hospedado gratuitamente no GitHub Pages sem nenhum servidor backend.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-cyan-400">
              <Terminal className="w-4 h-4" />
              <span>GitHub Actions Automático</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Arquivo <code className="text-cyan-300 font-mono">.github/workflows/deploy.yml</code> configurado para compilar e publicar a cada push na main.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-amber-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>Ícone & Favicon SVG</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ícone botânico configurado em <code className="text-amber-300 font-mono">public/favicon.svg</code> com tags de favicon, apple-touch-icon e manifest.
            </p>
          </div>
        </div>

        {/* README.md Preview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center space-x-1.5">
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span>README.md Formatado</span>
            </span>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopyReadme}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all"
              >
                {copiedType === 'readme' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedType === 'readme' ? 'Copiado!' : 'Copiar README.md'}</span>
              </button>

              <button
                onClick={handleDownloadReadme}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Baixar README.md</span>
              </button>
            </div>
          </div>

          <div className="h-64 rounded-2xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs text-slate-300 overflow-y-auto leading-relaxed select-all">
            <pre>{GITHUB_README_CONTENT}</pre>
          </div>
        </div>

        {/* GitHub Actions Workflow block */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center space-x-1.5">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>Workflow GitHub Actions (.github/workflows/deploy.yml)</span>
            </span>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopyWorkflow}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all"
              >
                {copiedType === 'workflow' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedType === 'workflow' ? 'Copiado!' : 'Copiar Workflow YAML'}</span>
              </button>

              <button
                onClick={handleDownloadWorkflow}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Baixar deploy.yml</span>
              </button>
            </div>
          </div>

          <div className="h-44 rounded-2xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs text-cyan-300 overflow-y-auto leading-relaxed select-all">
            <pre>{GITHUB_ACTIONS_WORKFLOW}</pre>
          </div>
        </div>

      </div>
    </div>
  );
};
