# بک‌اند Django برای Ludo Arena

این پوشه سرویس Django پروژه است و منطق قابل‌اتکای تاس، ثبت حرکت و وضعیت اتاق را از رابط React جدا می‌کند. رابط فعلی همچنان در `client/` قرار دارد؛ برای انتشار یکپارچه، این سرویس باید روی میزبان سازگار با Python اجرا شود یا پشت یک reverse proxy به خروجی React متصل گردد.

| مسیر | روش | کارکرد |
| --- | --- | --- |
| `/api/health/` | `GET` | بررسی وضعیت سرویس |
| `/api/game/roll/` | `POST` | تولید نتیجهٔ تاس ۱ تا ۶ |
| `/api/game/move/` | `POST` | اعتبارسنجی و ثبت حرکت مهره |
| `/api/game/room/<room_code>/` | `GET` | دریافت آخرین وضعیت اتاق |
| `/ws/rooms/<room_code>/` | `WebSocket` | ورود بازیکنان، تاس و پخش وضعیت زندهٔ اتاق |

## اجرا در محیط توسعه

```bash
cd django_backend
python3 -m pip install -r requirements.txt
python3 manage.py migrate
python3 manage.py runserver
```

## اتاق آنلاین و ASGI

برای تست محلی WebSocket از ASGI استفاده کنید:

```bash
cd django_backend
python3 manage.py migrate
daphne -b 0.0.0.0 -p 8011 ludo_api.asgi:application
```

در استقرار واقعی، `REDIS_URL` را برای لایهٔ کانال مشترک، و `DJANGO_CORS_ALLOWED_ORIGINS` را برای دامنهٔ رابط تنظیم کنید. در رابط نیز `VITE_DJANGO_WS_URL` را برابر URL پایهٔ WebSocket قرار دهید؛ برای نمونه `wss://api.example.com`.

> برای محیط عملیاتی، `DJANGO_SECRET_KEY`، `DJANGO_DEBUG=False` و `DJANGO_ALLOWED_HOSTS` را در متغیرهای محیطی تنظیم کنید. کلید محرمانهٔ پیش‌فرض صرفاً برای توسعه است.

برای اتصال APIهای HTTP، مقدار URL ریشهٔ این سرویس را در `VITE_DJANGO_API_URL` قرار دهید؛ مثلاً `https://api.example.com`. اگر این مقدار یا آدرس WebSocket تنظیم نشود، رابط برای پیش‌نمایش بصری از رفتار محلی استفاده می‌کند و اتصال آنلاین را فعال نمی‌سازد.
