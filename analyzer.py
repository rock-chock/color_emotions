from nltk.tokenize import TweetTokenizer

class Analyzer():
    """Implements sentiment analysis of one tweet"""

    def __init__(self, positives, negatives):
        """Initialize Analyzer."""

        # Read given files (positive-words.txt, negative-words.txt) into sets
        try:
            with open(positives, "r") as file:
                self.positives_f = {line.rstrip("\n") for line in file
                    if not (line.startswith(";") or line.startswith("\n"))}
        except IOError:
            sys.exit(f"Could not read positive words dict")

        try:
            with open(negatives, "r") as file:
                self.negatives_f = {line.rstrip("\n") for line in file
                    if not (line.startswith(";") or line.startswith("\n"))}
        except IOError:
            sys.exit(f"Could not read negative words dict")


    def analyze(self, text):
        """Analyze given text for sentiment, return a dictionary:
        {"score": score, "positive_tokens": positive_tokens, "negative_tokens": negative_tokens}
        """

        # Use NLTK tweet tokenizer to split given text into get list of words(tokens)
        tokenizer = TweetTokenizer()
        tokens_tweet = tokenizer.tokenize(text.lower())

        # Look for each word in dictionaries: "positives" and "negatives".
        # Calculate score: + 1 if in positives, -1 if in negatives
        # Create lists of positive and negative tokens in given text
        score = 0
        positive_tokens = []
        negative_tokens = []
        for word in tokens_tweet:
            if word in self.positives_f:
                score += 1
                positive_tokens.append(word)
            elif word in self.negatives_f:
                score += -1
                negative_tokens.append(word)

        return {"score": score, "positive_tokens": positive_tokens, "negative_tokens": negative_tokens}
