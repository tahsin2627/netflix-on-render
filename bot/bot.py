# bot.py - Test #2 (Checking Environment Variables)

import os
from flask import Flask
from telegram import Bot
from telegram.error import InvalidToken

app = Flask(__name__)

# --- Let's try to load the variables ---
TOKEN = os.environ.get('TELEGRAM_BOT_TOKEN')
BACKEND_API_URL = os.environ.get('BACKEND_API_URL')
BOT_URL = os.environ.get('BOT_URL') 

# --- Let's try to initialize the bot ---
bot_initialization_status = ""
try:
    if not TOKEN:
        raise ValueError("TELEGRAM_BOT_TOKEN is missing!")
    bot = Bot(token=TOKEN)
    bot_initialization_status = "✅ Success!"
except InvalidToken:
    bot_initialization_status = "❌ FAILED: The Telegram Token is invalid."
except ValueError as e:
    bot_initialization_status = f"❌ FAILED: {e}"
except Exception as e:
    bot_initialization_status = f"❌ FAILED with an unexpected error: {e}"


# This webpage will show us the status of our variables
@app.route('/')
def index():
    # Check if the variables were loaded from Render's environment
    token_status = "Loaded" if TOKEN else "MISSING!"
    backend_url_status = "Loaded" if BACKEND_API_URL else "MISSING!"
    bot_url_status = "Loaded" if BOT_URL else "MISSING!"

    # Create the HTML for the status page
    return (
        f"<h1>Bot Status Check</h1>"
        f"<p><b>TELEGRAM_BOT_TOKEN:</b> {token_status}</p>"
        f"<p><b>BACKEND_API_URL:</b> {backend_url_status}</p>"
        f"<p><b>BOT_URL:</b> {bot_url_status}</p>"
        f"<hr>"
        f"<h3>Telegram Bot Initialization Status:</h3>"
        f"<p>{bot_initialization_status}</p>"
    )

