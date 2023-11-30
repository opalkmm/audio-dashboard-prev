from flask import Flask, jsonify
import pandas as pd
import numpy as np
import string

app = Flask(__name__)


@app.route('/')
def text():
    text = "send this text"
    time = [0, 1, 2, 3]
    position = [0, 100, 200, 300]
    send_gif = "send this image"
    return jsonify({
        'time': time,
        'position': position,
        'text': text,
        'gif': send_gif
    })
