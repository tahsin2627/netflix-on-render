# bot/bot.py (Updated)

import os
import re
import requests
from flask import Flask, request
# Make sure to import ParseMode to format the message
from telegram import Update, Bot, ParseMode

# --- CONFIGURATION (from Render Environment Variables) ---
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
        streamLink = re.search(r"StreamLink: (.*)", text).group(1)
        downloadLink = re.search(r"DownloadLink: (.*)", text).group(1)
        description = re.search(r"Description: (.*)", text, re.DOTALL).group(1)
        return {
            "title": title.strip(),
            "category": category.strip(),
            "poster": poster.strip(),
            "streamLink": streamLink.strip(),
            "downloadLink": downloadLink.strip(),
            "description": description.strip()
        }
    except AttributeError:
        return None

@app.route('/webhook', methods=['POST'])
def webhook():
    """This endpoint receives all updates from Telegram."""
    json_data = request.get_json()
    update = Update.de_json(json_data, bot)
    
    if not update.message or not update.message.text:
        return "OK", 200

    chat_id = update.message.chat_id
    text = update.message.text

    # --- COMMAND ROUTING ---
    
    if text.startswith('/post'):
        data = parse_post_message(text)
        if data:
            try:
                # The endpoint is /api/post-content, which lives in our posts router
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
    
    # --- NEW /stats command logic ---
    elif text.startswith('/stats'):
        try:
            # The endpoint is /api/stats, which lives in our posts router
            api_endpoint = f"{BACKEND_API_URL}/api/stats"
            response = requests.get(api_endpoint)
            if response.status_code == 200:
                stats = response.json()
                message = (
                    f"📊 *Database Stats*\n\n"
                    f"🎬 Movies: *{stats['movies']}*\n"
                    f"📺 Series: *{stats['series']}*\n"
                    f"--------------------\n"
                    f"Total Posts: *{stats['total']}*"
                )
                # Send message with Markdown formatting
                bot.send_message(chat_id, text=message, parse_mode=ParseMode.MARKDOWN)
            else:
                bot.send_message(chat_id, text=f"❌ Error getting stats. Backend responded: {response.status_code}")
        except Exception as e:
            bot.send_message(chat_id, text=f"❌ An unexpected error occurred: {e}")

    return "OK", 200
