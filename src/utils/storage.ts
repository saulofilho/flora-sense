import { Plant, TweetItem, AlertLogItem } from '../types';
import { INITIAL_PLANTS } from '../data/defaultPlants';

const STORAGE_KEY_PLANTS = 'florasense_plants_v1';
const STORAGE_KEY_TWEETS = 'florasense_tweets_v1';
const STORAGE_KEY_ALERTS = 'florasense_alerts_v1';

export function loadStoredPlants(): Plant[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PLANTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Erro ao ler plantas do localStorage:', err);
  }
  return INITIAL_PLANTS;
}

export function saveStoredPlants(plants: Plant[]) {
  try {
    localStorage.setItem(STORAGE_KEY_PLANTS, JSON.stringify(plants));
  } catch (err) {
    console.error('Erro ao salvar plantas no localStorage:', err);
  }
}

export function loadStoredTweets(): TweetItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TWEETS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // Ignore
  }
  return [
    {
      id: 't-init-1',
      plantId: 'plant-monstera-1',
      plantName: 'Monstera da Sala',
      handle: 'MonsteraDramatica',
      content: '🥀 SOCORRO! O solo secou e sinto minhas folhas murchando lentamente... Será este o meu fim? Alguém traga um copo d’água! 💧💔 (Umidade: 28%)',
      timestamp: Date.now() - 3600000 * 3,
      likes: 14,
      retweets: 4,
      triggerReason: 'thirst_alert',
      postedToRealTwitter: true,
    },
    {
      id: 't-init-2',
      plantId: 'plant-samambaia-2',
      plantName: 'Samambaia da Varanda',
      handle: 'SamambaiaFofa',
      content: 'YAY! Ganhei água fresquinha! 🌧️🥰 Umidade agora em 72%. Tô muito feliz e pronta pra crescer! Te amo! 🌸🌱💚',
      timestamp: Date.now() - 86400000 * 1.5,
      likes: 29,
      retweets: 8,
      triggerReason: 'watered',
      postedToRealTwitter: true,
    },
    {
      id: 't-init-3',
      plantId: 'plant-manjericao-3',
      plantName: 'Manjericão do Chef',
      handle: 'ManjericaoRebelde',
      content: 'Parabéns! Você comprou uma planta achando que ela bebia ar e luz? Estou com 14% de umidade. O regador não morde, sabia? 🌵🙄',
      timestamp: Date.now() - 1800000,
      likes: 42,
      retweets: 19,
      triggerReason: 'critical_thirst',
      postedToRealTwitter: true,
    }
  ];
}

export function saveStoredTweets(tweets: TweetItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY_TWEETS, JSON.stringify(tweets.slice(0, 100)));
  } catch {
    // Ignore
  }
}

export function loadStoredAlerts(): AlertLogItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ALERTS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // Ignore
  }
  return [
    {
      id: 'alert-1',
      plantId: 'plant-manjericao-3',
      plantName: 'Manjericão do Chef',
      type: 'critical',
      title: '🚨 Umidade Crítica no Solo!',
      message: 'A umidade do Manjericão caiu para 14.2% (abaixo do limite de 18%). Tweet automático de socorro disparado!',
      timestamp: Date.now() - 1800000,
      moisture: 14.2,
      read: false,
    },
    {
      id: 'alert-2',
      plantId: 'plant-monstera-1',
      plantName: 'Monstera da Sala',
      type: 'warning',
      title: '🥀 Alerta de Sede!',
      message: 'Umidade da Monstera em 28.5% (limite mínimo: 35%). Regue em breve para evitar estresse hídrico.',
      timestamp: Date.now() - 3600000 * 3,
      moisture: 28.5,
      read: false,
    }
  ];
}

export function saveStoredAlerts(alerts: AlertLogItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY_ALERTS, JSON.stringify(alerts.slice(0, 100)));
  } catch {
    // Ignore
  }
}
