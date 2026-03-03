# Bot ETH

Простой Telegram-бот на Python.

## Возможности
- `/balance <адрес>` — показать ETH-баланс адреса.
- `/calc <выражение>` — вычислить математическое выражение (поддержка `+ - * / ** %`).

## Запуск
1. Установите зависимости (`python-telegram-bot`, `web3`).
2. Установите переменные окружения:
   - `TELEGRAM_TOKEN` — токен Telegram-бота.
   - `ETH_RPC` *(опционально)* — RPC URL Ethereum (по умолчанию `https://eth.llamarpc.com`).
3. Запустите:
   ```bash
   python bot.py
   ```
