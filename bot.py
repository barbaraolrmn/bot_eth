import os
import telegram
from telegram.ext import Updater, CommandHandler
"TOKEN = os.environ.get('TELEGRAM_TOKEN')" 
"def start(update, context):\n    update.message.reply_text('Привет! Я твой тестовый бот.')" 
"def main():\n    updater = Updater(TOKEN, use_context=True)\n    dp = updater.dispatcher\n    dp.add_handler(CommandHandler('start', start))\n    updater.start_polling()\n    updater.idle()" 
"if __name__ == '__main__':\n    main()" 
