# A super simple test version of bot.py

import os
from flask import Flask

app = Flask(__name__)

# A simple health check route
@app.route('/')
def index():
    return "Hello World! The test bot server is running."

# We have removed all other code for this test.
# No telegram bot logic, no webhooks, nothing else.
