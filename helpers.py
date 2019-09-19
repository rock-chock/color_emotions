# Working with Twitter API and parsing received data

import html
import os
#import socket

from twython import Twython
from twython import TwythonAuthError, TwythonError, TwythonRateLimitError
from time import strftime, strptime

def get_user_timeline(screen_name, limit):
    """Consume screen_name and limit.
    1) get "screen_name"'s most recent tweets from Twitter API
    2) parse received data to the list of dictionaries:  [{"date": <date>, "text":<tweet's_text>}, ...]
    """

    # Ensure environment variables are set
    if not os.environ.get("API_KEY"):
        os.environ["API_KEY"] = "<removed for security purposes>" #!
    if not os.environ.get("API_SECRET"):
        os.environ["API_SECRET"] = "<removed for security purposes>" #!

    # https://dev.twitter.com/rest/reference/get/users/lookup
    # https://dev.twitter.com/rest/reference/get/statuses/user_timeline
    # https://github.com/ryanmcgrath/twython/blob/master/twython/endpoints.py
    try:
        twitter = Twython(os.environ.get("API_KEY"), os.environ.get("API_SECRET"))
        user = twitter.lookup_user(screen_name=screen_name)
        if user[0]["protected"]:
            return None

        tweets = twitter.get_user_timeline(screen_name=screen_name, count=limit, tweet_mode="extended")

        return [{'date': tweet['created_at'],
                'text': html.unescape(tweet['full_text'].replace("\n", " "))} for tweet in tweets]

    except TwythonAuthError:
        raise RuntimeError("invalid API_KEY and/or API_SECRET") from None
    except TwythonError:
        return None
