# Bot ETH + AI Memecoin Scanner (RU)

Репозиторий содержит:

1. `bot.py` — простой Telegram-бот для проверки ETH-баланса.
2. `webapp/` — MVP веб-инструмента **AI Memecoin Scanner** на русском языке.

## Запуск веб-приложения

Из корня проекта:

```bash
python3 -m http.server 8080
```

Откройте в браузере:

- `http://localhost:8080/webapp/`

## Что умеет MVP Scanner

- Один главный ввод: тикер / CA / ссылка.
- Режимы: Quick / Deep / Execution.
- Подсчёт 6 суб-скоров:
  - Structural Risk
  - Distribution Risk
  - Market Quality
  - Narrative Strength
  - Community Quality
  - Entry Quality
- Hard fail override (cap score и жёсткая рекомендация).
- Вердикт + score + confidence + recommended action.
- Красные/зелёные флаги, anti-FOMO заметка, JSON output contract.

## Важно

Это демонстрационный MVP с эвристическим скорингом и детерминированной генерацией сигналов от входной строки.
Для production нужно подключить реальные адаптеры данных (DexScreener, GeckoTerminal, on-chain, social и т.д.).
