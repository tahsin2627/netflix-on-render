import os
import re
import requests
from flask import Flask, request
from telegram import Update, Bot

# --- CONFIGURATION ---
# We will get these values from Render's environment variables later
TOKEN = os.environ.get('TELEGRAM_BOT_TOKEN')
BACKEND_API_URL = os.environ.get('BACKEND_API_URL')
BOT_URL = os.environ.get('BOT_URL') 

bot = Bot(token=TOKEN)
app = Flask(__name__)

def parse_post_message(text):
    """Parses the message from the /post command."""
    try:
        title = re.search(r"Title: (.*)", text).group(1)
        category = re.search(r"Category: (.*)", text).group(1)
        poster = re.search(r"Poster: (.*)", text).group(1)
        description = re.search(r"Description: (.*)", text, re.DOTALL).group(1)
        return {
            "title": title.strip(),
            "category": category.strip(),
            "poster": poster.strip(),
            "description": description.strip()
        }
    except AttributeError:
        return None

@app.route('/webhook', methods=['POST'])
def webhook():
    """This endpoint receives updates from Telegram."""
    json_data = request.get_json()
    update = Update.de_json(json_data, bot)

    if update.message and update.message.text and update.message.text.startswith('/post'):
        chat_id = update.message.chat_id
        data = parse_post_message(update.message.text)

        if data:
            try:
                # Send the data to our backend service
                api_endpoint = f"{BACKEND_API_URL}/api/post-content"
                response = requests.post(api_endpoint, json=data)
                if response.status_code == 200:
                    bot.send_message(chat_id, text="✅ Success! Your content has been posted.")
                else:
                    bot.send_message(chat_id, text=f"❌ Error: Backend failed. Status: {response.status_code}\n{response.text}")
            except Exception as e:
                bot.send_message(chat_id, text=f"❌ Error sending request to backend: {e}")
        else:
             bot.send_message(
                chat_id,
                text="⚠️ Invalid format. Please use the specified format for the /post command."
            )

    return "OK", 200

# This special route is used by Render's health check to set up the webhook.
@app.route('/set_webhook', methods=['GET'])
def set_webhook():
    if BOT_URL and TOKEN:
        webhook_url = f"{BOT_URL}/webhook"
        # Tell Telegram where to send updates
        success = bot.set_webhook(webhook_url)
        if success:
            return f"Webhook set to {webhook_url}", 200
        else:
            return "Webhook setup failed", 500
    return "Missing required environment variables to set webhook", 400

# A simple welcome message for the root URL
@app.route('/')
def index():
    return "This is the Telegram bot for the Netflix Clone
