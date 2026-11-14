# Jazylam Reels — автопроизводство роликов

Код, из которого собираются рекламные ролики (Reels) для jazylam.kz.
Ролик: 1080×1920, 30 fps, 40–60 с, озвучка edge-tts (ru-RU-SvetlanaNeural), экраны сайта снимаются Playwright с подменой сервера (в базу ничего не пишется).

## Что где
- `video/` — проект Remotion 4 (`src/Demo4.tsx` — композиция, `public/shots/` — экраны сайта).
- `pipeline/script.json` — реплики; `marked.txt` — те же реплики с паузами (`/`, `//`).
- `pipeline/gen_stress.py` — озвучка и тайминги слов; `gen_tl.py` — таймлайн; `music.py` — музыка и сведение.
- `pipeline/capture_screens.py` — съёмка экранов регистрации с демо-данными.
- `videos/` — готовые ролики появляются здесь только после одобрения владельца.

## Правила
- Публикация только после явного «да» владельца.
- Демо-данные помечать как демо, не выдумывать цифры и отзывы, о конкурентах — только проверяемое и без резких оценок.
- Напоминать про метку «ИИ-контент» (через API её не поставить, включается вручную в приложении).

## Сборка (кратко)
1. `python3 pipeline/gen_stress.py` → `vo*.wav`, `script_t.json`
2. `python3 pipeline/gen_tl.py` → `tl.json` (копировать в `video/src/`)
3. `python3 pipeline/music.py` → `mix.wav` (в `video/public/`)
4. `cd video && npm i && npx remotion render src/index.ts Demo4 out/raw.mp4 --concurrency=2`
5. `ffmpeg -i out/raw.mp4 -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=11 -c:a aac -b:a 192k final.mp4`
