СЫРЬЁ ДЛЯ MINI APP (скачано 24.10.2026). Источник каждого файла — sources.json.

1. Канал @gadget_58 (raw/channel/)
- pages/page-001..012.html — все 12 страниц https://t.me/s/gadget_58 (посты #1–#361, 181 пост)
- photos/<номер поста>.jpg — 137 фото из постов; если в посте несколько фото: <пост>.jpg, <пост>-2.jpg, ...
  Видео не скачивались.
- avatar.jpg — аватар канала
- posts-text.txt — текст всех постов (номер поста + текст), удобно для разбора прайсов
- info.txt — адрес, часы работы, контакты, соцсети
  Найдено: г. Пенза, ул. Красная, 53, 2 этаж (ежедневно 10–19); в закрепе также Москва, м. Багратионовская,
  ул. Барклая, 8, пав. 285. Контакты @IgorSavchuk9, @adroganova, телефоны в info.txt.
  Ссылок на отзывы (Яндекс Карты / 2ГИС / Авито) в канале НЕТ. Есть VK и Instagram.

2. Apple (raw/apple/)
- pages/{iphone,mac,ipad,watch,airpods}.html — актуальные страницы apple.com (линейка на 24.10.2026:
  iPhone Duo, 18 Pro/Pro Max, Air, 17, 17e, 16; MacBook Air, MacBook Pro, MacBook Neo; iPad Pro/Air/iPad/mini;
  Watch Ultra 4, Series 12, SE 3; AirPods Pro 3, AirPods 5, AirPods Max 2)
- <id>-N.png — фото из store.storeimages.cdn-apple.com, 1600x1600, png-alpha (прозрачный/белый фон)
  Найдены ВСЕ модели из списка (89 файлов):
  iphone-duo 4, iphone-18-pro-max 4, iphone-18-pro 4, iphone-air 4, iphone-17 4, iphone-17e 3, iphone-16 4,
  macbook-air-13 4, macbook-air-15 3, macbook-pro-14 2, macbook-pro-16 2,
  ipad-pro 3, ipad-air 4, ipad 4, ipad-mini 4,
  watch-ultra-4 1, watch-s12 1, watch-se-3 1,
  airpods-pro-3 1, airpods-5 2, airpods-max 4,
  magsafe-charger 3, adapter-20w 2, case-iphone-18-pro 3, pencil-pro 2, pencil-usb-c 2, airtag 2, cable-usb-c 2,
  б/у: iphone-15-pro 2, iphone-14-pro 2, iphone-13 2, macbook-air-m1 2, ipad-air-5 2.
  Не найдено: — (всё нашлось)

Замечания для обработки:
- watch-*-1.png: часы занимают ~30% кадра — нужно обрезать по содержимому.
- macbook-pro-14/16: картинка на светло-серой квадратной подложке, не на прозрачном фоне.
- Фото MacBook Air/Pro взяты с текущих страниц магазина, но у Apple это ассеты 2024–2025 г.
  (дизайн не менялся, отдельных фото нового чипа нет). Аналогично iPad Pro/Air/mini/iPad — ассеты прошлых лет,
  которые Apple до сих пор показывает в магазине.
- airpods-max: на сайте теперь «AirPods Max 2», фото те же (цвета midnight/starlight/blue/orange).
- airtag: AirTag 2026 (1 шт. и набор 4 шт.). case-iphone-18-pro: силиконовый чехол MagSafe, цвет Crisp Blue (MK8W4).
- magsafe-charger: MGD74 (1 м); adapter-20w: MWVV3; cable-usb-c: MW493 (60W, 1 м).

3. Официальные фото, докачка (raw/web/), источники — raw/web/sources.json
- Apple, store.storeimages.cdn-apple.com, 1600x1600 png-alpha, кадр обрезан параметром cropN на стороне Apple
  (продукт занимает ~70-90% кадра): iphone-17-pro {cosmic-orange, deep-blue, silver},
  iphone-17-pro-max {cosmic-orange, deep-blue, silver}, iphone-17-white,
  б/у: iphone-13-pro-max-sierra-blue, iphone-14-pro-max {space-black, silver},
  iphone-15-pro {blue-titanium, natural-titanium}, iphone-15-pro-max-blue-titanium, iphone-16-pro-max-white-titanium.
- macbook-neo-{silver,blush,citrus,indigo}.jpg — apple.com/macbook-neo (вид сверху на закрытую крышку + торец),
  1812x1812, светло-серый фон Apple; macbook-neo-all-colors.jpg — все 4 цвета веером (магазин Apple), 2190x2190.
- dyson-airwrap-apricot-topaz.png — Airwrap i.d. Ceramic Apricot/Topaz (стайлер + насадки + кейс), dyson.com, 1096x1096, прозрачный фон.
- playstation-5-slim.png (1503x1503) и playstation-5-pro.png (1071x1071) — playstation.com, консоль + DualSense, прозрачный фон.
- yandex-station-midi-graphite.png — alice.yandex.ru/station, 722x722, прозрачный фон
  (это максимум: оригинал у Яндекса 1065x798, крупнее чистого рендера на сайте нет).
Файлы с пометкой «обрезано по продукту локально» в sources.json — оригинал по ссылке, обрезан квадратом вокруг продукта без масштабирования.
