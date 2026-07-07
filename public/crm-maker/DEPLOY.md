# CRM Maker — деплой на домене

Это собранный production-билд статического веб-приложения. Его нужно положить на любой статический хостинг и пробросить туда домен.

## Что внутри

- `index.html` — точка входа
- `assets/` — разбитый на чанки JS-бандл + CSS:
  - `index-*.js` — основной чанк, грузится сразу (~96 KB gzip)
  - `EditorPage-*.js` — страница редактора, грузится при клике «Продолжить»
  - `StatisticsPage-*.js` — дашборд статистики, грузится при открытии «Статистика»
  - Отдельный чанк для Tesseract.js — грузится при первой проверке постера

Бэкенд не нужен — приложение полностью клиентское. Зависимости (шрифты для канваса, OCR-модели Tesseract.js) подгружаются с CDN/GitHub при первом запуске и кэшируются в браузере.

## Что умеет инструмент

- Генерация баннеров (Bottom Sheet, WhatsApp, Push Android, Push iOS) из постеров + логотипов + текстов
- Редактор с превью: позиция и размер логотипа отдельно для каждого баннера
- OCR-проверка постеров на наличие текста (Tesseract.js, eng + ara)
- Внутренний дашборд статистики (кнопка «Статистика» в шапке) — на данных из локального хранилища браузера
- События параллельно отправляются в Google Analytics 4 (ID `G-WR859Q4VCY` зашит в бандле — см. ниже как сменить)

## Требования к хостингу

- Любая статика: nginx, Apache, Caddy, Netlify, Vercel, Cloudflare Pages, AWS S3 + CloudFront, GitHub Pages, Yandex Cloud Object Storage и т. п.
- **HTTPS обязателен** — Tesseract.js использует WebAssembly + Service Workers, многие браузеры блокируют их на HTTP
- Поддержка любых заголовков не требуется (CORS, COEP и т. п. не нужны)
- Доступ к `cdn.jsdelivr.net` и `raw.githubusercontent.com` со стороны пользователя — для загрузки OCR-моделей и графических ассетов

## Минимальный nginx-конфиг

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate     /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    root /var/www/crm-maker;
    index index.html;

    # Длинный кэш для assets/ (имена файлов с хэшем)
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # index.html без кэша
    location = /index.html {
        add_header Cache-Control "no-cache";
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}

server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$host$request_uri;
}
```

## Шаги для деплоя на VPS

1. Скопировать содержимое архива в `/var/www/crm-maker/` (или другую папку под вебом)
2. Положить SSL-сертификат (Let's Encrypt через `certbot` — самое простое)
3. Установить конфиг nginx из примера выше, поправив `server_name` и пути к сертификатам
4. `nginx -t && systemctl reload nginx`
5. Открыть домен в браузере

## Деплой на Netlify / Vercel / Cloudflare Pages (без VPS)

1. Создать новый проект, выбрать «deploy from drag-and-drop» или «upload folder»
2. Залить содержимое архива (без самой папки `dist`)
3. В настройках указать `index.html` как точку входа (обычно подхватывается автоматически)
4. Привязать свой домен в разделе Domains

## Локальная проверка перед деплоем

```bash
cd dist
python3 -m http.server 8080
# открыть http://localhost:8080
```

или

```bash
npx serve -s dist -l 8080
```

## Google Analytics

В бандле сейчас захардкожены ID:
- GA4 Measurement ID: `G-WR859Q4VCY`
- GTM Container: `GTM-MVBW5RN9`

Чтобы сменить — нужны исходники, а не этот dist-архив (минифицированный JS править не стоит). В исходниках файл `src/app/analyticsConfig.ts`:

```ts
export const GA_MEASUREMENT_ID = 'G-XXXXXXXX';  // ваш ID из analytics.google.com → Admin → Data Streams
export const GTM_CONTAINER_ID = '';             // пусто, если GTM не используете
```

После замены — `npm run build`, получится новый dist.

## Что делать, если что-то не работает

- **Белый экран, ошибки в консоли про MIME-type** — сервер отдаёт `.js` или `.css` с неправильным `Content-Type`. Лечится правильной настройкой `mime.types` в nginx (по умолчанию правильная)
- **Не загружается EditorPage / StatisticsPage** — это lazy-chunks. Если nginx не отдаёт `application/javascript` для них, браузер откажется их исполнять. Проверьте `mime.types`
- **OCR не работает, ругается на WebAssembly / SharedArrayBuffer** — скорее всего сайт открыт по HTTP. Подключайте HTTPS
- **OCR висит на «Проверяем постер…»** — первый запуск тянет ~10–15 MB языковых моделей с jsDelivr CDN. На медленном интернете может занять до минуты. После — кэшируется в браузере
- **Шрифты/градиенты не грузятся** — приложение тянет их из публичного GitHub-репозитория. Если у пользователя заблокирован GitHub (корпсеть, региональные блокировки) — нужно либо разблокировать, либо хостить ассеты у себя
- **«Статистика» пустая** — нормально для нового пользователя. Локальная стата копится в `localStorage` его браузера по мере использования. Кросс-устройство ничего не агрегируется — для team-wide зайдите в свой GA4
