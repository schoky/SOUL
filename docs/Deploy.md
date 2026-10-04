# SOUL — Лобби

> **Экран игрового лобби:** создаётся комната, подключаемся к существующей игре
> по коду, отображаются открытые комнаты и доступно управление своим текущим
> подключением.

---

## Что реализовано

В `LobbyPage` основной экран игрового лобби SOUL.

Здесь доступны возможности:

- 🏠 **создать новую комнату**;
- 🔑 **войти в комнату по шестизначному коду**;
- 🎯 **присоединиться к открытой комнате** из списка;
- 👤 **увидеть, под каким никнеймом я играю**;
- 🚪 **покинуть текущую комнату**;
- 👥 **посмотреть количество игроков** в каждой комнате;
- ⏳ увидеть состояние загрузки;
- ⚠️ получить сообщение об ошибке или результате действия.

---

## 🏗️ Архитектура страницы

Ответственность разделена между несколькими слоями:

```text
LobbyPage
   │
   ├── useAuthStore
   │      └── текущий пользователь
   │
   ├── useRoomStore
   │      ├── список комнат
   │      ├── текущая комната
   │      ├── загрузка
   │      ├── создание
   │      ├── подключение
   │      └── выход
   │
   └── MainLayout
          └── общий layout приложения
```

Такой подход позволяет не хранить серверное состояние непосредственно внутри
страницы. `LobbyPage` отвечает в первую очередь за **отображение и
пользовательские действия**, а `roomStore` — за работу с состоянием комнат.

---

## 🧩 Основные состояния

| Состояние       | Для чего используется                              |
|-----------------|----------------------------------------------------|
| `user`          | Получаем текущего авторизованного пользователя     |
| `rooms`         | Получаем список доступных комнат                   |
| `currentRoom`   | Проверяем, находится ли пользователь уже в комнате |
| `isLoading`     | Показываем загрузку списка комнат                  |
| `isMutating`    | Блокируем повторные действия во время запроса      |
| `storeError`    | Показываем ошибку от `roomStore`                   |
| `roomCode`      | Храним введённый код комнаты                       |
| `actionMessage` | Показываем результат действия                      |

---

# DEPLOY.md — деплой SOUL на Selectel

Инструкция по настройке сервера и запуску игры на `https://playsoul.ru`.

---

## Этап 0. Покупка и подготовка

### 0.1. Пополнение баланса Selectel

| Статья                              | Ориентировочная стоимость |
|-------------------------------------|--------------------------:|
| Домен `playsoul.ru`                 |                 120 ₽/год |
| VPS: 2 vCPU / 4 GB RAM / 40 GB NVMe |             750–900 ₽/мес |
| SSL-сертификат Let's Encrypt        |                       0 ₽ |

Для начала достаточно пополнить баланс примерно на **3000 ₽** — этой суммы
должно хватить на домен и около трёх месяцев VPS. Для запаса на полгода можно
пополнить на 5000 ₽.

В панели Selectel откройте **Биллинг → Пополнить баланс**.

### 0.2. Покупка домена

В панели Selectel откройте **Домены**, найдите `playsoul.ru` и купите домен на
один год.

Рекомендуемые настройки:

- Автопродление — включить.
- Приватность WHOIS — по желанию.

### 0.3. Создание VPS

В панели Selectel откройте **Облачные серверы → Создать сервер** и укажите:

- **Имя:** `soul-prod`
- **Образ:** Ubuntu 22.04 LTS
- **Конфигурация:** 2 vCPU / 4 GB RAM / 40 GB NVMe SSD
- **Локация:** Москва или Санкт-Петербург
- **Сеть:** публичный IPv4 и IPv6
- **SSH-ключ:** созданный на следующем шаге

### 0.4. Создание SSH-ключа

Если у меня ещё нет отдельного ключа для сервера, создаю его в Windows
PowerShell:

```powershell
ssh-keygen -t ed25519 -f $env:USERPROFILE\.ssh\soul_vps -C "soul-vps"
```

Трижды нажимаю Enter, чтобы оставить passphrase пустым. В результате появятся
два файла:

- `~/.ssh/soul_vps` — приватный ключ;
- `~/.ssh/soul_vps.pub` — публичный ключ.

Вывожу публичный ключ:

```powershell
Get-Content $env:USERPROFILE\.ssh\soul_vps.pub
```

Копирую его в панель Selectel при создании VPS.

### 0.5. Запись IP-адреса

После создания VPS сохраняю его публичный IPv4-адрес. Далее в инструкции вместо
`<IP>` указываю этот адрес.

---

## Этап 1. Привязка домена к VPS

В панели Selectel открываю **Домены → playsoul.ru → DNS-записи** и добавляю
записи:

| Тип | Имя   | Значение | TTL |
|-----|-------|----------|----:|
| A   | `@`   | `<IP>`   | 300 |
| A   | `www` | `<IP>`   | 300 |

Через 10–30 минут проверяю, что домен указывает на VPS:

```powershell
nslookup playsoul.ru
```

В ответе должен отображаться IP-адрес моего сервера.

---

## Этап 2. Первое подключение к серверу

В Windows PowerShell подключаюсь к VPS:

```powershell
ssh -i $env:USERPROFILE\.ssh\soul_vps root@<IP>
```

При первом подключении подтверждаю запрос `Are you sure...`, введя `yes`.

Все команды следующих этапов выполняю на сервере, если не указано иное.

---

## Этап 3. Базовая настройка сервера

### 3.1. Обновление системы и установка утилит

```bash
apt update && apt upgrade -y
apt install -y curl git ufw fail2ban nano htop
```

### 3.2. Создание рабочего пользователя `soul`

Для повседневной работы использую отдельного пользователя, а не `root`.

```bash
adduser soul
```

Задаю надёжный пароль. В дальнейшем для подключения буду использовать SSH-ключ.

Добавляю пользователя в группу `sudo`:

```bash
usermod -aG sudo soul
```

Копирую SSH-ключ в профиль пользователя `soul`:

```bash
mkdir -p /home/soul/.ssh
cp /root/.ssh/authorized_keys /home/soul/.ssh/authorized_keys
chown -R soul:soul /home/soul/.ssh
chmod 700 /home/soul/.ssh
chmod 600 /home/soul/.ssh/authorized_keys
```

В отдельном окне PowerShell проверяю подключение:

```powershell
ssh -i $env:USERPROFILE\.ssh\soul_vps soul@<IP>
```

Если подключение проходит, завершаю root-сессию командой `exit` и продолжаю
работу под пользователем `soul`.

### 3.3. Настройка файрвола

Разрешаю SSH, HTTP и HTTPS:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
sudo ufw status
```

Порт `3000` наружу не открываю: Node.js будет слушать `127.0.0.1`, а
подключаться к нему будет только Nginx.

### 3.4. Часовой пояс и swap

Устанавливаю московский часовой пояс и создаю swap-файл размером 2 GB:

```bash
sudo timedatectl set-timezone Europe/Moscow
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

Swap помогает снизить риск нехватки памяти во время сборки проекта.

---

## Этап 4. Установка зависимостей

### 4.1. Node.js 20

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v # ожидается v20.x
```

### 4.2. pnpm

```bash
sudo npm install -g pnpm@9
pnpm -v # ожидается 9.x
```

### 4.3. PostgreSQL

```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable postgresql
sudo systemctl status postgresql
```

В статусе службы должно быть указано `active (running)`.

### 4.4. Nginx и Certbot

```bash
sudo apt install -y nginx certbot python3-certbot-nginx
sudo systemctl enable nginx
```

### 4.5. PM2

```bash
sudo npm install -g pm2
pm2 -v
```

---

## Этап 5. Настройка PostgreSQL

### 5.1. Создание базы данных и пользователя

Генерирую пароль для пользователя базы данных:

```bash
openssl rand -base64 48 | tr '+/' '-_' | tr -d '='
```

Сохраняю результат и открываю PostgreSQL:

```bash
sudo -u postgres psql
```

В консоли `psql` создаю пользователя и базу данных. Вместо
`ВСТАВЬ_СЮДА_СГЕНЕРИРОВАННЫЙ_ПАРОЛЬ` указываю созданный пароль:

```sql
CREATE
USER soul_app WITH ENCRYPTED PASSWORD 'ВСТАВЬ_СЮДА_СГЕНЕРИРОВАННЫЙ_ПАРОЛЬ';
CREATE
DATABASE soul OWNER soul_app;
GRANT ALL PRIVILEGES ON DATABASE
soul TO soul_app;
\q
```

Сохраняю этот пароль: он понадобится для `DATABASE_URL` в `.env.production`.

### 5.2. Проверка подключения

Проверяю, что пользователь может подключиться к базе:

```bash
psql -U soul_app -h 127.0.0.1 -d soul
```

Ввожу пароль. Для выхода из `psql` использую команду:

```text
\q
```

---

## Этап 6. Подготовка проекта на Windows

Все действия этого этапа выполняю локально, в каталоге `D:\SOUL`.

### 6.1. Проверка `.gitignore`

Убеждаюсь, что в корневом `.gitignore` есть следующие правила:

```gitignore
node_modules/
dist/
.vite/
*.local

.env
.env.*
!.env.example

.DS_Store
.idea/
.vscode/
soul-windows.dump
packages/database/src/generated/
```

Файл `.env.production` не должен попадать в Git.

### 6.2. Файл `.env.example`

Проверяю, что в корне проекта есть `.env.example` без реальных секретов:

```ini
NODE_ENV=development
PORT=3000
HOST=127.0.0.1

TURN_HANDOFF_DELAY_MS=2500

POSTGRES_DB=soul
POSTGRES_USER=postgres
POSTGRES_PASSWORD=
DATABASE_URL=postgresql://postgres:password@127.0.0.1:5432/soul?schema=public

CLIENT_URL=http://localhost:5173
OAUTH_REDIRECT_BASE=http://localhost:3000

SESSION_SECRET=
JWT_SECRET=
COOKIE_SECRET=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
TWITCH_CLIENT_ID=
TWITCH_CLIENT_SECRET=
```

### 6.3. Файл `ecosystem.config.js`

В корне проекта создаю `ecosystem.config.js`:

```js
module.exports = {
	apps: [
		{
			name: "soul-server",
			script: "apps/server/dist/index.js",
			cwd: "/var/www/soul",
			env_file: ".env.production",
			instances: 1,
			exec_mode: "fork",
			max_memory_restart: "512M",
			autorestart: true,
			watch: false,
			kill_timeout: 5000,
			listen_timeout: 10000,
			merge_logs: true,
			time: true,
		},
	],
};
```

### 6.4. Файл `deploy.sh`

В корне проекта создаю `deploy.sh`:

```bash
#!/usr/bin/env bash
set -e

cd /var/www/soul

echo "==> git pull"
git pull

echo "==> pnpm install"
pnpm install --frozen-lockfile

echo "==> prisma migrate deploy"
pnpm --filter @soul/database db:migrate:deploy

echo "==> prisma generate"
pnpm --filter @soul/database db:generate

echo "==> build client"
pnpm --filter @soul/client build

echo "==> build server"
pnpm --filter @soul/server build

echo "==> restart PM2"
pm2 restart soul-server

echo "==> Готово"
```

Добавляю скрипту executable-бит через Git и отправляю изменения в репозиторий:

```powershell
git add deploy.sh .gitattributes
git update-index --chmod=+x deploy.sh
git commit -m "Скрипты деплоя"
git push
```

### 6.5. Проверка локальной сборки

До деплоя проверяю, что клиент и сервер собираются без ошибок:

```bash
pnpm --filter @soul/client build
pnpm --filter @soul/server build
```

---

## Этап 7. Клонирование проекта на сервер

Все действия этого этапа выполняю на сервере под пользователем `soul`.

### 7.1. Подготовка директории

```bash
sudo mkdir -p /var/www/soul
sudo chown -R soul:soul /var/www/soul
```

### 7.2. SSH-ключ для GitHub

На сервере создаю ключ для доступа к GitHub:

```bash
ssh-keygen -t ed25519 -C "soul-vps-deploy"
# Нажимаю Enter три раза
cat ~/.ssh/id_ed25519.pub
```

Копирую публичный ключ. В GitHub открываю **Settings → SSH and GPG keys → New
SSH key** и добавляю его:

- **Title:** `Soul VPS`
- **Key:** скопированный публичный ключ

Проверяю подключение:

```bash
ssh -T git@github.com
```

GitHub должен подтвердить успешную аутентификацию, например:

```text
Hi schoky! You've successfully authenticated...
```

### 7.3. Клонирование репозитория

```bash
cd /var/www
git clone git@github.com:schoky/SOUL.git soul
cd soul
```

### 7.4. Создание `.env.production`

#### Назначение файла

Файл `.env` хранит настройки приложения: пароли, секреты, адреса базы данных и
домены. В коде приложение получает их через `process.env`.

Локальные и продакшен-настройки хранятся отдельно:

| Среда     | Где находится | Файл              | Кто использует       |
|-----------|---------------|-------------------|----------------------|
| Локальная | Windows       | `.env`            | Node.js, Prisma, tsx |
| Продакшен | VPS           | `.env.production` | PM2, Node.js, Prisma |

Локальный `.env` не переношу на сервер и не переименовываю. Для VPS создаю
отдельный `.env.production`.

Не копирую локальные значения: пароль базы данных и тестовые секреты должны быть
заменены, а `CLIENT_URL` должен указывать на продакшен-домен.

#### Генерация секретов

Трижды выполняю на сервере команду:

```bash
openssl rand -base64 48 | tr '+/' '-_' | tr -d '='
```

Сохраняю каждый результат отдельно:

1. Первый — для `SESSION_SECRET`.
2. Второй — для `JWT_SECRET`.
3. Третий — для `COOKIE_SECRET`.

#### Создание файла

```bash
cd /var/www/soul
nano .env.production
```

Добавляю настройки:

```ini
NODE_ENV=production
PORT=3000
HOST=127.0.0.1

TURN_HANDOFF_DELAY_MS=2500

DATABASE_URL=postgresql://soul_app:ПАРОЛЬ_БД@127.0.0.1:5432/soul?schema=public

OAUTH_REDIRECT_BASE=https://playsoul.ru
CLIENT_URL=https://playsoul.ru

SESSION_SECRET=СЕКРЕТ_1
JWT_SECRET=СЕКРЕТ_2
COOKIE_SECRET=СЕКРЕТ_3

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=

TWITCH_CLIENT_ID=
TWITCH_CLIENT_SECRET=
```

Заменяю значения:

- `ПАРОЛЬ_БД` — пароль пользователя `soul_app` из этапа 5;
- `СЕКРЕТ_1`, `СЕКРЕТ_2`, `СЕКРЕТ_3` — сгенерированные секреты.

Работа с `nano`:

- Вставка в PowerShell-сессии: `Ctrl+Shift+V` или `Shift+Insert`.
- Сохранение: `Ctrl+O`, затем Enter.
- Выход: `Ctrl+X`.
- Кавычки вокруг значений не нужны.

#### Проверка и защита файла

Проверяю содержимое:

```bash
cat .env.production
```

Сверяю пароль с паролем пользователя PostgreSQL и убеждаюсь, что все нужные
значения заполнены.

Проверяю, что файл исключён из Git:

```bash
git status
```

Затем ограничиваю доступ к файлу:

```bash
chmod 600 .env.production
```

В Git храню `.env.example` без секретов и правила `.gitignore`. Локальный `.env`
и продакшен-файл `.env.production` в репозиторий не добавляю.

---

## Этап 8. Первый билд и запуск

### 8.1. Установка зависимостей и сборка

```bash
cd /var/www/soul
pnpm install
pnpm --filter @soul/database db:migrate:deploy
pnpm --filter @soul/database db:generate
pnpm --filter @soul/client build
pnpm --filter @soul/server build
```

Первая установка зависимостей и сборка могут занять 5–10 минут.

Если `db:migrate:deploy` завершается с ошибкой, проверяю `DATABASE_URL`, пароль
базы данных и наличие базы `soul`.

### 8.2. Загрузка начальных данных

```bash
pnpm --filter @soul/database db:seed
```

Ожидаемый вывод:

```text
✔ Загружено персонажей: 10
✔ Загружено событий: 12
```

### 8.3. Тестовый запуск

Запускаю сервер вручную:

```bash
node apps/server/dist/index.js
```

Ожидаемый вывод:

```text
Подключение к PostgreSQL установлено
SOUL server запущен на http://127.0.0.1:3000
```

В отдельном SSH-окне проверяю health endpoint:

```bash
curl http://127.0.0.1:3000/health
```

Ожидаемый ответ:

```json
{
	"status": "ok",
	...
}
```

После успешной проверки останавливаю тестовый сервер сочетанием `Ctrl+C`.

### 8.4. Запуск через PM2

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 status
```

### 8.5. Автозапуск PM2

Настраиваю запуск PM2 после перезагрузки сервера:

```bash
pm2 startup
```

PM2 выведет команду примерно такого вида:

```text
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u soul --hp /home/soul
```

Копирую и выполняю именно ту команду, которую вывел PM2.

Проверяю состояние службы:

```bash
sudo systemctl status pm2-soul
```

Ожидаемый статус — `active (running)`.

---

## Этап 9. Настройка Nginx

### 9.1. Конфигурация сайта

Создаю конфигурационный файл:

```bash
sudo nano /etc/nginx/sites-available/soul
```

Добавляю настройки:

```nginx
server {
    listen 80;
    server_name playsoul.ru www.playsoul.ru;

    root /var/www/soul/apps/client/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|webp|svg|woff2?|ttf|otf|ico)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /socket.io/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
    }
}
```

Активирую сайт и проверяю конфигурацию:

```bash
sudo ln -s /etc/nginx/sites-available/soul /etc/nginx/sites-enabled/soul
sudo nginx -t
sudo systemctl reload nginx
```

Проверяю, что Nginx отдаёт HTML:

```bash
curl -H "Host: playsoul.ru" http://127.0.0.1/
```

### 9.2. Проверка домена

Открываю `http://playsoul.ru` в браузере. До настройки HTTPS страница может
отображаться без стилей.

Если сайт недоступен, проверяю A-запись:

```powershell
nslookup playsoul.ru
```

---

## Этап 10. Настройка SSL

Запрашиваю сертификат Let's Encrypt:

```bash
sudo certbot --nginx -d playsoul.ru -d www.playsoul.ru
```

В диалоге Certbot:

- указываю свой email;
- принимаю условия, введя `Y`;
- отказываюсь от рассылки, введя `N`;
- выбираю перенаправление HTTP на HTTPS — вариант `2`.

Проверяю конфигурацию и HTTPS:

```bash
sudo nginx -t
sudo systemctl reload nginx
curl -I https://playsoul.ru
```

Ожидаемый статус — `HTTP/2 200`.

Проверяю автоматическое обновление сертификата:

```bash
sudo certbot renew --dry-run
```

---

## Этап 11. Проверка сайта и игры

### 11.1. Проверка HTTPS и WSS

Открываю `https://playsoul.ru`.

В инструментах разработчика браузера проверяю:

- **Network → WS:** установлено соединение `wss://playsoul.ru/socket.io/...`;
- **Network → XHR:** запрос `/api/auth/me` возвращает статус `200`.

### 11.2. Проверка игрового процесса

Проверяю основные сценарии:

1. Регистрирую первого пользователя.
2. Открываю сайт в режиме инкогнито и регистрирую второго.
3. Создаю комнату, приглашаю второго игрока и играю партию.
4. Проверяю список друзей, уведомления и звуки.

### 11.3. Настройка OAuth

Если используются Google, Discord или Twitch, обновляю в настройках провайдера
`Authorized redirect URI`.

Пример адреса:

```text
https://playsoul.ru/api/auth/oauth/google/callback
```

Точный путь проверяю в файле:

```text
apps/server/src/auth/oauth/oauthRoutes.ts
```

### 11.4. Просмотр логов

```bash
pm2 logs soul-server
pm2 monit
```

В `pm2 monit` отслеживаю загрузку CPU и использование памяти.

---

## Этап 12. Обновление проекта

Локально, на Windows, сохраняю и отправляю изменения:

```powershell
git add .
git commit -m "..."
git push
```

Подключаюсь к серверу и запускаю деплой:

```bash
ssh -i ~/.ssh/soul_vps soul@<IP>
cd /var/www/soul
bash deploy.sh
```

Скрипт обновляет код, устанавливает зависимости, применяет миграции, собирает
клиент и сервер, затем перезапускает PM2.

Если после обновления Nginx не отдаёт новую версию клиента, добавляю в конец
`deploy.sh`:

```bash
sudo systemctl reload nginx
```

Чтобы пользователь `soul` мог перезагружать Nginx без ввода пароля, открываю
редактор `sudo`:

```bash
sudo visudo
```

Добавляю строку:

```text
soul ALL=(ALL) NOPASSWD: /bin/systemctl reload nginx
```

---

## Этап 13. Резервное копирование

### 13.1. Настройка ежедневного дампа

Создаю каталог для резервных копий:

```bash
sudo mkdir -p /root/backups
```

Чтобы `pg_dump` мог подключаться к базе без запроса пароля, создаю файл
`/root/.pgpass`:

```bash
sudo nano /root/.pgpass
```

Добавляю строку, заменив `ПАРОЛЬ_БД` паролем пользователя `soul_app`:

```text
127.0.0.1:5432:soul:soul_app:ПАРОЛЬ_БД
```

Ограничиваю права на файл:

```bash
sudo chmod 600 /root/.pgpass
```

Открываю планировщик заданий для пользователя `root`:

```bash
sudo crontab -e
```

Добавляю задания:

```cron
0 3 * * * pg_dump -w -U soul_app -h 127.0.0.1 soul | gzip > /root/backups/soul-$(date +\%F).sql.gz
0 4 * * 0 find /root/backups -type f -mtime +7 -delete
```

Первое задание ежедневно в 03:00 сохраняет сжатый дамп базы данных. Второе —
каждое воскресенье в 04:00 удаляет копии старше семи дней.

### 13.2. Проверка резервной копии

Проверяю, что файл дампа создан:

```bash
sudo ls -lh /root/backups
```

Проверяю целостность архива:

```bash
sudo gzip -t /root/backups/soul-$(date +\%F).sql.gz
```

При успешной проверке команда завершается без ошибки и не выводит сообщений.

Чтобы проверить содержимое файла, вывожу первые строки дампа:

```bash
sudo zcat /root/backups/soul-$(date +\%F).sql.gz | head -n 20
```

Если дамп не создаётся, проверяю настройки cron и права доступа к
`/root/.pgpass`. Также сверяю пароль в файле с паролем пользователя PostgreSQL.

### 13.3. Тестовое восстановление

Для проверки восстановления использую отдельную тестовую базу. Рабочую базу
`soul` не перезаписываю.

Создаю временную базу:

```bash
sudo -u postgres psql -c "CREATE DATABASE soul_restore_test OWNER soul_app;"
```

Выбираю дамп и восстанавливаю его в тестовую базу. В команде заменяю
`YYYY-MM-DD` на дату файла, например `2026-01-31`:

```bash
sudo bash -c 'zcat /root/backups/soul-YYYY-MM-DD.sql.gz | PGPASSFILE=/root/.pgpass psql -w -U soul_app -h 127.0.0.1 -d soul_restore_test'
```

Проверяю, что таблицы восстановлены:

```bash
sudo -u postgres psql -d soul_restore_test -c "\dt"
```

Когда тест восстановления завершён, удаляю временную базу:

```bash
sudo -u postgres psql -c "DROP DATABASE soul_restore_test;"
```

Храню резервные копии не только на VPS: при сбое сервера локальные дампы могут
стать недоступны вместе с ним.