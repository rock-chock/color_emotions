from flask import Flask, render_template, jsonify, request, Response
from json import dumps
import html

import helpers
from analyzer import Analyzer

import os
import sys

app = Flask(__name__)

# Reload templates when they are changed
app.config["TEMPLATES_AUTO_RELOAD"] = True


@app.after_request
def after_request(response):
    """ Disable caching """
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Expires"] = 0
    response.headers["Pragma"] = "no-cache"
    return response


@app.route("/", methods=["GET", "POST"])
def index():
    """Handle requests for / via GET (and POST)"""
    return render_template("index.html")


@app.route("/search", methods=["GET"])
def search():
    """Return JSON object that contains sentiment scores of the whole timeline, user tweets and sentiments scores of each tweet
    timeline_json = { "statistics_timeline": [{"sentiment": str, "amount": int}, ...],
                      "tweets_data": <tweets_data> }
    tweets_data = [{"date": str, "score": int, "positive_tokens": int, "negative_tokens": int, "text": str}, ...]
    """

    # Validate screen_name and limit
    screen_name = request.args.get("screen_name", "").lstrip("@")
    if not screen_name:
        return jsonify(error={"code": 400, "name":"",
           "message": "Could not get @username"})

    limit = request.args.get("limit")
    if not limit:
        return jsonify(error={"code": 400, "name":"",
            "message": "Could not get tweets limit"})
    if int(limit) < 1 or int(limit) > 300:
        return jsonify(error={"code": 400, "name":"",
            "message": "Not valid limit. Enter lower number"})


    # Get screen_name's tweets
    # tweet = {"date": f_str, "text": str}
    # tweets = [tweet0, tweet1, ...]
    tweets = helpers.get_user_timeline(screen_name, int(limit))
    if not tweets:
        return jsonify(error={"code": 400, "name":"",
            "message": "Could not get user's timeline"})

    # Absolute paths to dictionaries (.txt) of positives and negatives
    #positives = os.path.join(sys.path[0], "positive-words.txt")
    #negatives = os.path.join(sys.path[0], "negative-words.txt")
    #positives = "/positive-words.txt"
    #negatives = "/negative-words.txt"
    positives = os.path.abspath("positive-words.txt")
    negatives = os.path.abspath("negative-words.txt")

    # Instantiate analyzer
    analyzer = Analyzer(positives, negatives)

    # Analyze screen_name's timeline.
    # 1) Get amount of positive, negative and neutral tweets in the given timeline.
    # 2) Create a list of sentiment score for each tweet
    # analysis_one = {"score": int, "positive_tokens": [str, str, ...], "negative_tokens": [str, str, ...]}
    # analysis_all = [analysis_one, ...]
    positive_tweets, negative_tweets, neutral_tweets = 0.0, 0.0, 0.0
    analysis_all = []
    for tweet in tweets:
        analysis_one = analyzer.analyze(tweet["text"])
        analysis_all.append(analysis_one)
        if analysis_one["score"] > 0.0:
            positive_tweets += 1
        elif analysis_one["score"] < 0.0:
            negative_tweets += 1
        else:
            neutral_tweets += 1


    # Create a single JSON object for representing user's timeline and it's sentiment scores
    tweets_data = []

    for i in range(len(tweets)):
        data = {}
        data["date"] = tweets[i]["date"]
        data["score"] = analysis_all[i]["score"]
        data["positive_tokens"] = analysis_all[i]["positive_tokens"]
        data["negative_tokens"] = analysis_all[i]["negative_tokens"]
        data["text"] = tweets[i]["text"]

        tweets_data.append(data)

    timeline_json = {
        "statistics_timeline": [
            { "sentiment": "positive", "amount": positive_tweets },
            { "sentiment": "negative", "amount": negative_tweets},
            { "sentiment": "neutral", "amount": neutral_tweets}
        ],
        "tweets_data": tweets_data
    }

    return Response(dumps(timeline_json),  mimetype='application/json')
