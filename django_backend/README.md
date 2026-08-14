# بک‌اند Django برای Ludo Arena

این پوشه سرویس Django پروژه است و منطق قابل‌اتکای تاس، ثبت حرکت و وضعیت اتاق را از رابط React جدا می‌کند. رابط فعلی همچنان در `client/` قرار دارد؛ برای انتشار یکپارچه، این سرویس باید روی میزبان سازگار با Python اجرا شود یا پشت یک reverse proxy به خروجی React متصل گردد.

| مسیر | روش | کارکرد |
| --- | --- | --- |
| `/api/health/` | `GET` | بررسی وضعیت سرویس |
| `/api/game/roll/` | `POST` | تولید نتیجهٔ تاس ۱ تا ۶ |
| `/api/game/move/` | `POST` | اعتبارسنجی و ثبت حرکت مهره |
| `/api/game/room/<room_code>/` | `GET` | دریافت آخرین وضعیت اتاق |

## اجرا در محیط توسعه

```bash
cd django_backend
python3 -m pip install -r requirements.txt
python3 manage.py migrate
python3 manage.py runserver
```

> برای محیط عملیاتی، `DJANGO_SECRET_KEY`، `DJANGO_DEBUG=False` و `DJANGO_ALLOWED_HOSTS` را در متغیرهای محیطی تنظیم کنید. کلید محرمانهٔ پیش‌فرض صرفاً برای توسعه است.

برای اتصال UI، مقدار URL ریشهٔ این سرویس را در `VITE_DJANGO_API_URL` قرار دهید؛ مثلاً `https://api.example.com`. اگر این مقدار تنظیم نشود، رابط برای پیش‌نمایش بصری به‌صورت محلی شبیه‌سازی می‌شود و هیچ درخواست شبکه‌ای ارسال نمی‌کند.
