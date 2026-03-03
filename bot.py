import ast
import operator
import os
from telegram.ext import CommandHandler, Updater
from web3 import Web3

# Получаем токен Telegram бота и RPC ETH
TELEGRAM_TOKEN = os.environ.get("TELEGRAM_TOKEN")
ETH_RPC = os.environ.get("ETH_RPC", "https://eth.llamarpc.com")  # можно заменить на Infura

# Подключение к Ethereum
w3 = Web3(Web3.HTTPProvider(ETH_RPC))

# Разрешённые операции для калькулятора
_ALLOWED_OPERATORS = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.Pow: operator.pow,
    ast.Mod: operator.mod,
    ast.USub: operator.neg,
    ast.UAdd: operator.pos,
}


def _eval_expression(expression: str) -> float:
    """Безопасно вычисляет математическое выражение."""

    def _eval_node(node):
        if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
            return node.value

        if isinstance(node, ast.BinOp) and type(node.op) in _ALLOWED_OPERATORS:
            left = _eval_node(node.left)
            right = _eval_node(node.right)
            return _ALLOWED_OPERATORS[type(node.op)](left, right)

        if isinstance(node, ast.UnaryOp) and type(node.op) in _ALLOWED_OPERATORS:
            return _ALLOWED_OPERATORS[type(node.op)](_eval_node(node.operand))

        raise ValueError("Недопустимое выражение")

    parsed = ast.parse(expression, mode="eval")
    return _eval_node(parsed.body)


def start(update, context):
    update.message.reply_text(
        "Привет! Я ETH-бот.\n"
        "Команды:\n"
        "/balance <адрес> — баланс ETH\n"
        "/calc <выражение> — калькулятор"
    )


def balance(update, context):
    if not context.args:
        update.message.reply_text("⚠ Адрес: /balance 0x123...")
        return

    address = context.args[0]
    if not w3.is_address(address):
        update.message.reply_text("❌ Некорректный адрес")
        return

    try:
        wei_balance = w3.eth.get_balance(address)
        eth_balance = w3.from_wei(wei_balance, "ether")
        update.message.reply_text(f"💰 Баланс {address}:\n{eth_balance} ETH")
    except Exception as e:
        update.message.reply_text(f"Ошибка: {str(e)}")


def calc(update, context):
    if not context.args:
        update.message.reply_text("⚠ Использование: /calc 2 + 2")
        return

    expression = " ".join(context.args)

    try:
        result = _eval_expression(expression)
        update.message.reply_text(f"🧮 {expression} = {result}")
    except ZeroDivisionError:
        update.message.reply_text("❌ Деление на ноль")
    except Exception:
        update.message.reply_text(
            "❌ Не удалось вычислить выражение. Разрешены числа и операции + - * / ** %"
        )


def main():
    updater = Updater(TELEGRAM_TOKEN, use_context=True)
    dp = updater.dispatcher
    dp.add_handler(CommandHandler("start", start))
    dp.add_handler(CommandHandler("balance", balance))
    dp.add_handler(CommandHandler("calc", calc))
    updater.start_polling()
    updater.idle()


if __name__ == "__main__":
    main()
