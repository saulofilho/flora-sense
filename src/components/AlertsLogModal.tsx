import React from 'react';
import { 
  Bell, 
  X, 
  Check, 
  Trash2, 
  AlertTriangle, 
  Droplet, 
  Info, 
  Send,
  Sparkles,
  Volume2
} from 'lucide-react';
import { AlertLogItem } from '../types';
import { 
  requestNotificationPermission, 
  getNotificationPermissionStatus, 
  dispatchPlantAlert 
} from '../utils/notifications';

interface AlertsLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: AlertLogItem[];
  onClearAlerts: () => void;
  onMarkAllRead: () => void;
}

export const AlertsLogModal: React.FC<AlertsLogModalProps> = ({
  isOpen,
  onClose,
  alerts,
  onClearAlerts,
  onMarkAllRead,
}) => {
  const permStatus = getNotificationPermissionStatus();

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    await requestNotificationPermission();
  };

  const handleSendTestNotification = () => {
    dispatchPlantAlert({
      title: '🚨 Teste de Alerta: FloraSense',
      body: 'Notificação do sistema funcionando perfeitamente no seu celular e navegador! 🌿💧',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                Histórico de Alertas & Notificações
              </h3>
              <p className="text-xs text-slate-400">
                Registro de eventos críticos de umidade e avisos enviados
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

        {/* Permission Banner */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold text-white">
              Status das Notificações do Navegador:
            </div>
            <span className={`text-[11px] font-bold ${
              permStatus === 'granted' ? 'text-emerald-400' : 'text-amber-400'
            }`}>
              {permStatus === 'granted' ? '✓ Autorizadas (Recebendo alertas no celular/desktop)' : '⚠️ Permissão Pendente ou Negada'}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {permStatus !== 'granted' && (
              <button
                onClick={handleRequestPermission}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all"
              >
                Permitir Alertas
              </button>
            )}

            <button
              onClick={handleSendTestNotification}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all"
            >
              Testar Agora
            </button>
          </div>
        </div>

        {/* Alerts List */}
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {alerts.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-xs">
              Nenhum alerta registrado até o momento.
            </div>
          ) : (
            alerts.map((alert) => {
              const time = new Date(alert.timestamp).toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={alert.id}
                  className={`p-4 rounded-2xl border transition-all space-y-1.5 ${
                    alert.type === 'critical'
                      ? 'bg-rose-950/20 border-rose-500/30'
                      : alert.type === 'warning'
                      ? 'bg-amber-950/20 border-amber-500/30'
                      : alert.type === 'success'
                      ? 'bg-emerald-950/20 border-emerald-500/30'
                      : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-white">
                        {alert.title}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                        {alert.plantName}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {time}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {alert.message}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        {alerts.length > 0 && (
          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <button
              onClick={onClearAlerts}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/50 hover:text-rose-300 text-slate-400 text-xs font-semibold transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpar Histórico</span>
            </button>

            <button
              onClick={onMarkAllRead}
              className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all"
            >
              Marcar Todos como Lidos
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
