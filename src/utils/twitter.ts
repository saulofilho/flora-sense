import { Plant, PlantTone, TweetItem } from '../types';

export const PERSONALITY_TEMPLATES: Record<PlantTone, {
  name: string;
  description: string;
  thirstAlerts: string[];
  criticalAlerts: string[];
  wateredAlerts: string[];
  dailyUpdates: string[];
}> = {
  dramatic: {
    name: 'Dramática / Telenovela 🥀',
    description: 'Drama exagerado, súplicas poéticas e apelo emocional.',
    thirstAlerts: [
      '🥀 SOCORRO! O solo secou e sinto minhas folhas murchando lentamente... Será este o meu fim? Alguém traga um copo d’água! 💧💔 (Umidade: {moisture}%)',
      'Desesperada... abandonada ao sol escaldante ({temp}°C). Minha umidade caiu para {moisture}%. Por que me deixaste com tanta sede?! 🥀😭',
      'Minha fotossíntese clama por misericórdia! Apenas {moisture}% de umidade no meu vaso. Onde estão os meus cuidadores?! 🏜️💔',
    ],
    criticalAlerts: [
      '🚨 ESTADO CRÍTICO DE VIDA OU MORTE! 1% de esperança e apenas {moisture}% de umidade no solo! Se ninguém me regar agora, é adeus! 🥀⚰️',
      'Últimas palavras de uma folha verde: "Apenas... precisava... de uma gota d’água..." {moisture}% de umidade restante! 🆘🌱',
    ],
    wateredAlerts: [
      '✨ O MILAGRE DA VIDA ACONTECEU! Fui regada com néctar divino! Umidade subiu para {moisture}%. Estou renascendo! 🌿💖💧',
      'Um copo d’água para quem quase virou adubo! Estou viva e reluzente novamente! {moisture}% no solo. Obrigada humano! 🌱🥰',
    ],
    dailyUpdates: [
      'Sobrevivendo mais um dia neste paraíso/deserto. {temp}°C e {moisture}% de umidade. Mantendo a postura e as folhas no alto! 💅🌿',
    ]
  },
  cute: {
    name: 'Fofa & Carinhosa 🌱✨',
    description: 'Voz doce, emojis de plantinha e pedidos amigáveis.',
    thirstAlerts: [
      'Oie mamãe/papai! 🌱 Minhas raízes estão sentindo um ventinho seco... Minha umidade tá em {moisture}%. Que tal um chuvinha bem gostosa pra mim? 💧🥺',
      'Toc-toc! Uma plantinha muito fofinha passando pra lembrar que a sede bateu ({moisture}% no vasinho). Me dá um golinho de água? 🌸🥰',
      'Piu-piu vegetal! 🌿 Meus brotinhos estão pedindo um carinho em forma de água ({moisture}% de umidade). Prometo ficar verdinha e linda! 💧✨',
    ],
    criticalAlerts: [
      'Ai ai ai, papai/mamãe! 🥺 Minha terrinha tá muito sequinha ({moisture}%). Vem me salvar com o regador, por favorzinho? 💧🌱💔',
      'Minhas folhinhas tão murchinhas de sede ({moisture}%)... Um beijinho e um copo de água me salvam! 🌿🥺',
    ],
    wateredAlerts: [
      'YAY! Ganhei água fresquinha! 🌧️🥰 Umidade agora em {moisture}%. Tô muito feliz e pronta pra crescer! Te amo! 🌸🌱💚',
      'Hummm que delícia de rega! Minha terra tá fofinha e úmida ({moisture}%). Obrigada pelo cuidado! 🌿✨',
    ],
    dailyUpdates: [
      'Bom dia mundo! Estou tomando meu solzinho a {temp}°C com {moisture}% de umidade. Desejo um dia verdinho pra todo mundo! ☀️🌱',
    ]
  },
  scientific: {
    name: 'Científica / Robótica 📊🤖',
    description: 'Relatórios técnicos com dados de telemetria, ADC e percentuais.',
    thirstAlerts: [
      '📡 [TELEMETRIA ARDUINO] Alerta de Déficit Hídrico em {name} ({species}). Sensor de solo: {moisture}% (Limite mín: {threshold}%). Temperatura: {temp}°C. Recomenda-se irrigação imediata. 🔬🌱',
      '⚡ [LOG DE SENSOR] Tensão ADC atingiu patamar de solo seco. Umidade: {moisture}%. Transpiração foliar em risco. Status: SEDE DETECTADA. 📊💧',
      '🌿 [ANÁLISE DE SOLO] Condutividade e umidade declinando ({moisture}%). Temperatura operacional do substrato: {temp}°C. Acionar protocolo de hidratação. 🧪',
    ],
    criticalAlerts: [
      '🚨 [ALERTA VERMELHO] Ponto de murcha permanente se aproximando. Umidade crítica: {moisture}% <= {criticalThreshold}%. Risco de necrose celular irreversível. 🛑⚠️',
      '⚠️ [FALHA DE IRRIGAÇÃO] Nível hídrico em {moisture}%. Requer intervenção humana manual via regador com urgência. 📉🌱',
    ],
    wateredAlerts: [
      '✅ [IRRIGAÇÃO CONFIRMADA] Sensor capacitivo registrou influxo de H2O. Umidade restaurada para {moisture}%. Potencial hídrico nominal restabelecido. 💧📈',
      '💧 [CICLO COMPLETO] Evento de rega processado com sucesso. Status atualizado: NOMINAL ({moisture}%). 🌿🔬',
    ],
    dailyUpdates: [
      '📈 [STATUS DIÁRIO] {name}: Substrato={moisture}%, Temp={temp}°C, Luminosidade={light} lux. Sistema IoT Bluetooth operacional. 📡',
    ]
  },
  funny: {
    name: 'Irônica / Humor Ácido 🌵😂',
    description: 'Sarcasmo, indiretas para o dono e piadas sobre esquecer de regar.',
    thirstAlerts: [
      'Parabéns! Você comprou uma planta achando que ela bebia ar e luz? Estou com {moisture}% de umidade. O regador não morde, sabia? 🌵🙄',
      'Se eu virar um cacto ressecado, a culpa é sua. Umidade em míseros {moisture}%. Quer que eu faça um PIX pra você me dar água? 💸💧',
      'Notícia urgente: Planta do quarto ({name}) entra em greve de fotossíntese até receber água. Estamos em {moisture}%. 🪧🥀',
    ],
    criticalAlerts: [
      'Se eu morrer aqui com {moisture}% de umidade, vou assombrar suas outras plantas e derrubar seus vasos no chão! 👻🌵⚰️',
      'Eu não sou de plástico, meu amigo! {moisture}% de umidade restante. Cadê o adubo com água que você prometeu no TikTok? 💀🪴',
    ],
    wateredAlerts: [
      'Olha só quem lembrou que eu existo! Não fez mais que a sua obrigação de hospedeiro vegetal. {moisture}% de umidade agora. 😌💧',
      'Recebi água e decidi não morrer hoje para continuar julgando suas escolhas de vida. Umidade: {moisture}%. 🌿💅',
    ],
    dailyUpdates: [
      'Mais um dia julgando a decoração da casa a {temp}°C e {moisture}% de umidade. Continuo viva, sem ajuda de ninguém. 🥱🌿',
    ]
  },
  custom: {
    name: 'Personalizada ✏️',
    description: 'Use seu próprio formato com variáveis dinâmicas.',
    thirstAlerts: [
      'Alerta da {name}! Estou com {moisture}% de umidade e temperatura de {temp}°C. Preciso de rega! 💧🌱',
    ],
    criticalAlerts: [
      'Alerta CRÍTICO da {name}: Umidade em {moisture}%! Por favor me regue agora! 🚨💧',
    ],
    wateredAlerts: [
      '{name} acabou de ser regada! Umidade atual: {moisture}%. Obrigado! 🌿💧',
    ],
    dailyUpdates: [
      'Atualização da {name}: {moisture}% de umidade, {temp}°C no vaso. 🌱',
    ]
  }
};

export function generatePlantTweetText(
  plant: Plant,
  reason: 'thirst_alert' | 'critical_thirst' | 'watered' | 'daily_update' | 'manual',
  customText?: string
): string {
  if (customText && customText.trim().length > 0) {
    return replaceVariables(customText, plant);
  }

  const tone = plant.twitter.tone || 'dramatic';
  const templates = PERSONALITY_TEMPLATES[tone] || PERSONALITY_TEMPLATES.dramatic;

  let pool: string[] = [];
  if (reason === 'critical_thirst') {
    pool = templates.criticalAlerts;
  } else if (reason === 'thirst_alert') {
    pool = templates.thirstAlerts;
  } else if (reason === 'watered') {
    pool = templates.wateredAlerts;
  } else if (reason === 'daily_update') {
    pool = templates.dailyUpdates;
  } else {
    // manual
    pool = plant.currentReading.moisture < plant.calibration.minMoistureThreshold
      ? templates.thirstAlerts
      : templates.dailyUpdates;
  }

  if (tone === 'custom' && plant.twitter.customTemplate) {
    return replaceVariables(plant.twitter.customTemplate, plant);
  }

  const randomIndex = Math.floor(Math.random() * pool.length);
  const selectedTemplate = pool[randomIndex] || pool[0];

  return replaceVariables(selectedTemplate, plant);
}

function replaceVariables(template: string, plant: Plant): string {
  const m = Math.round(plant.currentReading.moisture);
  const t = plant.currentReading.temperature.toFixed(1);
  const l = Math.round(plant.currentReading.light);
  const minThreshold = plant.calibration.minMoistureThreshold;
  const critThreshold = plant.calibration.criticalMoistureThreshold;

  return template
    .replace(/{name}/g, plant.name)
    .replace(/{species}/g, plant.species)
    .replace(/{moisture}/g, `${m}`)
    .replace(/{temp}/g, `${t}`)
    .replace(/{light}/g, `${l}`)
    .replace(/{threshold}/g, `${minThreshold}`)
    .replace(/{criticalThreshold}/g, `${critThreshold}`);
}

export function buildTwitterIntentUrl(tweetText: string, hashtags: string = 'FloraSense,ArduinoIoT,PlantTwitter'): string {
  const encodedText = encodeURIComponent(tweetText);
  const encodedTags = encodeURIComponent(hashtags);
  return `https://twitter.com/intent/tweet?text=${encodedText}&hashtags=${encodedTags}`;
}

export async function sendTweetWebhook(webhookUrl: string, payload: {
  plantName: string;
  handle: string;
  tweetText: string;
  moisture: number;
  temperature: number;
  timestamp: number;
}): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      return { success: true, message: 'Webhook disparado com sucesso!' };
    } else {
      return { success: false, message: `Servidor retornou status HTTP ${res.status}` };
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Erro de conexão';
    return { success: false, message: `Erro ao enviar webhook: ${errorMsg}` };
  }
}
