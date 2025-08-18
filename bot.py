import os
from telegram.ext import Updater, CommandHandler
from web3 import Web3

# Получаем токен Telegram бота и RPC ETH
TELEGRAM_TOKEN = os.environ.get("TELEGRAM_TOKEN")
ETH_RPC = os.environ.get("ETH_RPC", "https://eth.llamarpc.com")  # можно заменить на Infura

# Подключение к Ethereum
w3 = Web3(Web3.HTTPProvider(ETH_RPC))

def start(update, context):
    update.message.reply_text("HI! I am ETH bot. Add /balance <adress> than know you balance")

def balance(update, context):
    if not context.args:
        update.message.reply_text("⚠ Adress: /balance 0x123...")
        return
    
    address = context.args[0]
    if not w3.is_address(address):
        update.message.reply_text("❌ Error")
        return
    
    try:
        wei_balance = w3.eth.get_balance(address)
        eth_balance = w3.from_wei(wei_balance, 'ether')
        update.message.reply_text(f"💰 Баланс {address}:\n{eth_balance} ETH")
    except Exception as e:
        update.message.reply_text(f"Error: {str(e)}")

def main():
    updater = Updater(TELEGRAM_TOKEN, use_context=True)
    dp = updater.dispatcher
    dp.add_handler(CommandHandler("start", start))
    dp.add_handler(CommandHandler("balance", balance))
    updater.start_polling()
    updater.idle()

if __name__ == "__main__":
    main()
