import { SOCKET_EVENTS } from '@soul/shared';
import { useEffect, useState } from 'react';

import {
  type AdminSocketLog,
  type AdminSocketLogType,
  getAdminSocketLogs,
  getAdminSocketLogsExportUrl
} from '../../services/api/admin';
import { socket } from '../../services/socket';

const MAX_LOGS = 200;

const TYPE_LABELS: Record<AdminSocketLogType, string> = {
  'socket:connected': 'Подключение',
  'socket:disconnected': 'Отключение',
  'auth:failed': 'Ошибка авторизации'
};

const TYPE_BADGES: Record<AdminSocketLogType, string> = {
  'socket:connected': 'admin-badge--success',
  'socket:disconnected': 'admin-badge--warning',
  'auth:failed': 'admin-badge--danger'
};

type FilterValue = 'all' | AdminSocketLogType;

function AdminLogs() {
  const [logs, setLogs] = useState<AdminSocketLog[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const [filter, setFilter] = useState<FilterValue>('all');

  // Начальная загрузка + перезагрузка при смене фильтра.
  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);

    getAdminSocketLogs({
      limit: MAX_LOGS,
      type: filter === 'all' ? undefined : filter
    })
      .then((data) => {
        if (!cancelled) {
          setLogs(data);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [filter]);

  // Realtime: подписка на новые логи.
  useEffect(() => {
    function handleLogAdded(log: AdminSocketLog) {
      // Если включён фильтр — игнорируем чужие типы.
      if (filter !== 'all' && log.type !== filter) {
        return;
      }

      setLogs((prev) => [log, ...prev].slice(0, MAX_LOGS));
    }

    socket.on(SOCKET_EVENTS.ADMIN_LOG_ADDED, handleLogAdded);

    return () => {
      socket.off(SOCKET_EVENTS.ADMIN_LOG_ADDED, handleLogAdded);
    };
  }, [filter]);

  const exportUrl = getAdminSocketLogsExportUrl(filter === 'all' ? {} : { type: filter });

  return (
    <div className='admin-page'>
      <header className='admin-page__header'>
        <p className='admin-page__eyebrow'>ЛОГИ</p>

        <h1 className='admin-page__title'>Логи сокетов</h1>
      </header>

      <div className='admin-logs__filters'>
        {(['all', 'socket:connected', 'socket:disconnected', 'auth:failed'] as FilterValue[]).map(
          (value) => (
            <button
              className={[
                'admin-button',
                'admin-button--small',
                filter === value ? 'admin-button--primary' : ''
              ]
                .filter(Boolean)
                .join(' ')}
              key={value}
              type='button'
              onClick={() => setFilter(value)}
            >
              {value === 'all' ? 'Все' : TYPE_LABELS[value]}
            </button>
          )
        )}

        <a className='admin-button admin-button--small' href={exportUrl} download>
          Экспорт в CSV
        </a>
      </div>

      {isLoading && <p className='admin-loading'>Загружаем…</p>}

      {!isLoading && logs.length === 0 && <p className='admin-empty'>Логов пока нет</p>}

      {!isLoading && logs.length > 0 && (
        <div className='admin-logs'>
          <div className='admin-logs__list'>
            {logs.map((log) => (
              <div className='admin-logs__entry' key={log.id}>
                <span className='admin-logs__time'>
                  {new Date(log.timestamp).toLocaleString('ru-RU')}
                </span>

                <span className={`admin-badge ${TYPE_BADGES[log.type]}`}>
                  {TYPE_LABELS[log.type]}
                </span>

                <span className='admin-logs__message'>{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminLogs;
