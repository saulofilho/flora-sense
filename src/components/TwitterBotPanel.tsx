import React, { useState } from 'react';
import { 
  Twitter, 
  Sparkles, 
  Send, 
  RefreshCw, 
  ExternalLink, 
  Settings2, 
  Heart, 
  Repeat, 
  MessageSquare, 
  Share, 
  Flame, 
  Check, 
  AlertCircle, 
  Copy,
  Clock,
  Radio,
  Sliders,
  Webhook
} from 'lucide-react';
import { Plant, PlantTone, TweetItem } from '../types';
import { PERSONALITY_TEMPLATES, generatePlantTweetText, buildTwitterIntentUrl, sendTweetWebhook } from '../utils/twitter';

interface TwitterBotPanelProps {
  plant: Plant;
  tweets: TweetItem[];
  onUpdatePlantTwitter: (plantId: string, updatedTwitter: Plant['twitter']) => void;
  onPostTweet: (plant: Plant, reason: 'thirst_alert' | 'critical_thirst' | 'watered' | 'manual', customText?: string) => void;
}

export const TwitterBotPanel: React.FC<TwitterBotPanelProps> = ({
  plant,
  tweets,
  onUpdatePlantTwitter,
  onPostTweet,
}) => {
  const { twitter, currentReading, calibration } = plant;
  const isThirsty = currentReading.moisture <= calibration.minMoistureThreshold;

  const [selectedTone, setSelectedTone] = useState<PlantTone>(twitter.tone || 'dramatic');
  const [handleInput, setHandleInput] = useState(twitter.handle);
  const [displayNameInput, setDisplayNameInput] = useState(twitter.displayName);
  const [bioInput, setBioInput] = useState(twitter.bio);
  const [customTemplateInput, setCustomTemplateInput] = useState(twitter.customTemplate || '');
  const [webhookUrlInput, setWebhookUrlInput] = useState(twitter.webhookUrl || '');
  const [autoTweetEnabled, setAutoTweetEnabled] = useState(twitter.autoTweetOnThirst);
  const [cooldownHours, setCooldownHours] = useState(twitter.cooldownHours || 2);

  const [currentDraft, setCurrentDraft] = useState(() => 
    generatePlantTweetText(plant, isThirsty ? 'thirst_alert' : 'daily_update')
  );

  const [isSaved, setIsSaved] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [webhookStatus, setWebhookStatus] = useState<string | null>(null);

  // Filter tweets for this plant
  const plantTweets = tweets.filter((t) => t.plantId === plant.id);

  const handleToneChange = (tone: PlantTone) => {
    setSelectedTone(tone);
    const updated = { ...twitter, tone };
    onUpdatePlantTwitter(plant.id, updated);
    
    // update preview
    const tempPlant = { ...plant, twitter: updated };
    setCurrentDraft(generatePlantTweetText(tempPlant, isThirsty ? 'thirst_alert' : 'daily_update'));
  };

  const handleGenerateNextDraft = () => {
    const tempPlant = { ...plant, twitter: { ...twitter, tone: selectedTone } };
    setCurrentDraft(generatePlantTweetText(tempPlant, isThirsty ? 'thirst_alert' : 'daily_update'));
  };

  const handleSaveSettings = () => {
    const updated: Plant['twitter'] = {
      ...twitter,
      handle: handleInput.trim().replace(/^@/, ''),
      displayName: displayNameInput.trim(),
      bio: bioInput.trim(),
      tone: selectedTone,
      customTemplate: customTemplateInput.trim(),
      webhookUrl: webhookUrlInput.trim(),
      autoTweetOnThirst: autoTweetEnabled,
      cooldownHours,
    };
    onUpdatePlantTwitter(plant.id, updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleCopyDraft = () => {
    navigator.clipboard.writeText(currentDraft);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleTestWebhook = async () => {
    if (!webhookUrlInput) {
      setWebhookStatus('Informe a URL do Webhook primeiro.');
      return;
    }
    setWebhookStatus('Enviando payload para o Webhook...');
    const res = await sendTweetWebhook(webhookUrlInput, {
      plantName: plant.name,
      handle: twitter.handle,
      tweetText: currentDraft,
      moisture: currentReading.moisture,
      temperature: currentReading.temperature,
      timestamp: Date.now(),
    });
    setWebhookStatus(res.message);
  };

  return (
    <div className="space-y-6">
      
      {/* Twitter Account Card Header */}
      <div className="rounded-3xl p-6 bg-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
        {/* Cover banner */}
        <div className="h-28 -mx-6 -mt-6 bg-gradient-to-r from-emerald-700 via-teal-800 to-sky-900 flex items-end px-6 pb-2">
          <div className="text-xs font-semibold text-emerald-200/80 uppercase tracking-wider flex items-center space-x-1.5">
            <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-300" />
            <span>Conta de Twitter da Planta • Monitoramento IoT Conectado</span>
          </div>
        </div>

        {/* Profile Info Bar */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-10 mb-4 gap-4">
          <div className="flex items-end space-x-4">
            <div className="w-20 h-20 rounded-3xl bg-slate-950 border-4 border-slate-900 flex items-center justify-center text-4xl shadow-xl">
              {plant.avatar || '🌿'}
            </div>
            <div className="pb-1">
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-extrabold text-white">
                  {twitter.displayName || plant.name}
                </h3>
                <span className="w-4 h-4 rounded-full bg-sky-500 flex items-center justify-center text-[10px] text-white font-bold" title="Verificada por FloraSense">
                  ✓
                </span>
              </div>
              <p className="text-sm font-semibold text-sky-400">
                @{twitter.handle || 'minhaplanta_bot'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <a
              href={buildTwitterIntentUrl(currentDraft)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs shadow-lg shadow-sky-950/40 transition-all"
            >
              <Twitter className="w-3.5 h-3.5 fill-current" />
              <span>Tweetar Agora no X</span>
              <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
            </a>
          </div>
        </div>

        {/* Bio */}
        <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
          {twitter.bio || 'Sou uma planta conectada a um sensor de solo Arduino. Tuíto automaticamente quando sinto sede! 🌱💧'}
        </p>

        {/* Live status badge inside profile */}
        <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-slate-800 text-xs text-slate-400">
          <div>
            <span className="font-bold text-white">Umidade Atual: </span>
            <span className={isThirsty ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
              {currentReading.moisture.toFixed(1)}% {isThirsty ? '(SEDE)' : '(OK)'}
            </span>
          </div>
          <div>
            <span className="font-bold text-white">Auto-Tweet: </span>
            <span className={twitter.autoTweetOnThirst ? 'text-emerald-400' : 'text-slate-500'}>
              {twitter.autoTweetOnThirst ? 'Ativado ✓' : 'Pausado'}
            </span>
          </div>
          <div>
            <span className="font-bold text-white">Intervalo Mínimo: </span>
            <span>A cada {twitter.cooldownHours}h</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Composer & Personality on Left, Feed on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Personality & Composer */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Personality Tone Selector */}
          <div className="rounded-3xl p-6 bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Personalidade do Twitter da Planta</span>
              </h4>
            </div>
            
            <p className="text-xs text-slate-400">
              Escolha como sua planta se expressará no X quando o sensor de umidade detectar sede no solo:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(Object.keys(PERSONALITY_TEMPLATES) as PlantTone[]).map((tone) => {
                const config = PERSONALITY_TEMPLATES[tone];
                const active = selectedTone === tone;
                return (
                  <button
                    key={tone}
                    onClick={() => handleToneChange(tone)}
                    className={`p-3 rounded-2xl text-left border transition-all ${
                      active
                        ? 'bg-emerald-950/60 border-emerald-500 text-white ring-1 ring-emerald-500/50 shadow-md'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="text-xs font-bold text-white flex items-center justify-between">
                      <span>{config.name}</span>
                      {active && <span className="text-emerald-400 text-xs">✓</span>}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                      {config.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Tweet Composer & Variable Editor */}
          <div className="rounded-3xl p-6 bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                <Twitter className="w-4 h-4 text-sky-400 fill-current" />
                <span>Gerador de Tweet em Tempo Real</span>
              </h4>
              <button
                onClick={handleGenerateNextDraft}
                className="flex items-center space-x-1 text-xs text-slate-400 hover:text-emerald-400 transition-colors"
                title="Sortear outra frase da personalidade"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Sortear Variação</span>
              </button>
            </div>

            {/* Editable Draft Area */}
            <div className="relative">
              <textarea
                value={currentDraft}
                onChange={(e) => setCurrentDraft(e.target.value)}
                rows={4}
                className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-sky-500 transition-all font-sans leading-relaxed"
                placeholder="Texto do tweet gerado..."
              />
              <div className="absolute bottom-3 right-3 flex items-center space-x-2">
                <span className="text-[10px] text-slate-500 font-mono">
                  {currentDraft.length}/280
                </span>
              </div>
            </div>

            {/* Quick Variable Tags Helper */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
              <span className="font-semibold text-slate-300">Variáveis:</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-300 font-mono">{"{name}"}</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-300 font-mono">{"{moisture}"}%</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-300 font-mono">{"{temp}"}°C</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-300 font-mono">{"{threshold}"}%</span>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center justify-between pt-2 gap-2">
              <button
                onClick={handleCopyDraft}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? 'Copiado!' : 'Copiar Texto'}</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onPostTweet(plant, isThirsty ? 'thirst_alert' : 'manual', currentDraft)}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all"
                >
                  <Send className="w-3.5 h-3.5 text-sky-400" />
                  <span>Gravar no Feed</span>
                </button>

                <a
                  href={buildTwitterIntentUrl(currentDraft)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold shadow-md shadow-sky-950/40 transition-all"
                >
                  <Twitter className="w-3.5 h-3.5 fill-current" />
                  <span>Publicar no X</span>
                </a>
              </div>
            </div>

          </div>

          {/* Twitter Account Settings & Webhook */}
          <div className="rounded-3xl p-6 bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center space-x-2">
              <Settings2 className="w-4 h-4 text-emerald-400" />
              <span>Configurações da Conta & Automação</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nome de Exibição
                </label>
                <input
                  type="text"
                  value={displayNameInput}
                  onChange={(e) => setDisplayNameInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  @ Handle do Twitter
                </label>
                <div className="flex items-center">
                  <span className="px-3 py-2 rounded-l-xl bg-slate-800 border border-r-0 border-slate-700 text-xs text-slate-400">@</span>
                  <input
                    type="text"
                    value={handleInput}
                    onChange={(e) => setHandleInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-r-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Auto Tweet Toggle & Cooldown */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Disparar Tweet Automático em Sede</div>
                  <p className="text-[11px] text-slate-400">
                    Gera tweet assim que o sensor cair abaixo de {calibration.minMoistureThreshold}%
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={autoTweetEnabled}
                  onChange={(e) => setAutoTweetEnabled(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <span className="text-xs text-slate-300">Tempo de Espera Anti-Spam:</span>
                <select
                  value={cooldownHours}
                  onChange={(e) => setCooldownHours(Number(e.target.value))}
                  className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                >
                  <option value={1}>1 hora</option>
                  <option value={2}>2 horas</option>
                  <option value={4}>4 horas</option>
                  <option value={8}>8 horas</option>
                  <option value={24}>24 horas (1x ao dia)</option>
                </select>
              </div>
            </div>

            {/* Webhook URL for Direct Automatic Posting */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                <span className="flex items-center space-x-1">
                  <Webhook className="w-3.5 h-3.5 text-cyan-400" />
                  <span>URL de Webhook (Make / Zapier / N8N / Discord)</span>
                </span>
                <span className="text-[10px] text-slate-500">Opcional</span>
              </label>
              <div className="flex space-x-2">
                <input
                  type="url"
                  placeholder="https://hook.eu1.make.com/..."
                  value={webhookUrlInput}
                  onChange={(e) => setWebhookUrlInput(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                />
                <button
                  onClick={handleTestWebhook}
                  className="px-3 py-2 rounded-xl bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 text-xs font-semibold transition-all"
                >
                  Testar
                </button>
              </div>
              {webhookStatus && (
                <p className="text-[11px] text-cyan-400 mt-1 font-mono">{webhookStatus}</p>
              )}
            </div>

            <button
              onClick={handleSaveSettings}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/40 transition-all flex items-center justify-center space-x-1.5"
            >
              {isSaved ? <Check className="w-4 h-4" /> : <Settings2 className="w-4 h-4" />}
              <span>{isSaved ? 'Configurações Salvas!' : 'Salvar Configurações do Twitter'}</span>
            </button>
          </div>

        </div>

        {/* Right Column: Timeline & Feed of Plant's Tweets */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center space-x-2">
              <Twitter className="w-4 h-4 text-sky-400 fill-current" />
              <span>Linha do Tempo de Tweets de {plant.name}</span>
            </h4>
            <span className="text-xs text-slate-400 font-semibold">
              {plantTweets.length} {plantTweets.length === 1 ? 'tweet' : 'tweets'}
            </span>
          </div>

          {plantTweets.length === 0 ? (
            <div className="rounded-3xl p-8 bg-slate-900/60 border border-slate-800 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-2xl mx-auto mb-3">
                🐦
              </div>
              <h5 className="text-sm font-bold text-white">Nenhum tweet gravado ainda</h5>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Quando a umidade cair ou você clicar em "Gravar no Feed" ou "Tweetar", as postagens da planta aparecerão aqui.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {plantTweets.map((tweet) => {
                const dateStr = new Date(tweet.timestamp).toLocaleString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={tweet.id}
                    className="rounded-2xl p-4 bg-slate-900/90 border border-slate-800 shadow-md hover:border-slate-700 transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xl shadow-inner">
                          {plant.avatar || '🌿'}
                        </div>
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="text-xs font-bold text-white">
                              {tweet.plantName}
                            </span>
                            <span className="text-xs text-slate-400">
                              @{tweet.handle}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {dateStr}
                          </span>
                        </div>
                      </div>

                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        tweet.triggerReason === 'critical_thirst'
                          ? 'bg-rose-500/20 text-rose-300'
                          : tweet.triggerReason === 'thirst_alert'
                          ? 'bg-amber-500/20 text-amber-300'
                          : tweet.triggerReason === 'watered'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-sky-500/20 text-sky-300'
                      }`}>
                        {tweet.triggerReason === 'critical_thirst' ? 'Sede Crítica' : tweet.triggerReason === 'thirst_alert' ? 'Sede' : tweet.triggerReason === 'watered' ? 'Rega' : 'Manual'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-200 font-sans leading-relaxed">
                      {tweet.content}
                    </p>

                    {/* Footer interactions */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs text-slate-400">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1 hover:text-rose-400 cursor-pointer">
                          <Heart className="w-3.5 h-3.5" />
                          <span>{tweet.likes}</span>
                        </div>
                        <div className="flex items-center space-x-1 hover:text-emerald-400 cursor-pointer">
                          <Repeat className="w-3.5 h-3.5" />
                          <span>{tweet.retweets}</span>
                        </div>
                        <div className="flex items-center space-x-1 hover:text-sky-400 cursor-pointer">
                          <MessageSquare className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      <a
                        href={buildTwitterIntentUrl(tweet.content)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 text-sky-400 hover:text-sky-300 font-semibold"
                      >
                        <span>Abrir no X</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
