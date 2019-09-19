# COLOR EMOTIONS

Working version:
https://color-emotions.herokuapp.com/


Presentation:

https://drive.google.com/open?id=14EALAcOD2sdga2wCX5ovvVKAar-hVwtN

https://youtu.be/dJe1VkfsMXc


Author:

Elena Kochegarova

https://www.linkedin.com/in/kochegarova-elena-10471548/

https://github.com/rock-chock



## Info about Color Emotions

A single-page web-app that generates colored diary of emotions from a user's Twitter


This web-app
1. implements sentiment analysis of a user's Twitter posts and
2. renders automatically generated visual diary based on total emotional score of the recent posts



It is known that the words
a person tends to use frequently,
represent his personality and his way of thinking.

This app helps to get insights about
- people's mood at a given moment,
- general coloring of their feelings at a given period of time
- attitude to the world from an objective historical perspective



### Possible usages of this service:

This webapp can be used
- by journalists and students

  to compare famous people's public profile images
  or to research emotional impulse that a company  gives to it's audience

- by school psychologists or any other psychologist

  to quickly get the image of how content or unhappy his client is
  or how does his emotional state changes after their session.

- by recruiters

  via this web-app they can quickly analyze employee's current mood
  and, for example, understand that this employee is close to burnout and needs help
  or that he is fine and self-motivated

- by any person who has some spare time and curiosity

  for example, to know about his friend's or relative's current mood, or to get self-reflective visualization, compare it to what is happening in his or her own life.

  This can help to determine if everything is okay in hos/her life or there are needed some changes.



### Languages and tools

Python | Flask | JSON | NLTK|
JavaScript | D3.js | AJAX | jQuery|
HTML | JINJA | Bootstrap | CSS



## Project structure

#### Folder static
##### Source code of tools
- Bootstrap.css
- D3.js
- d3ScaleChromatic.js - for mapping daily sentiments score with the color of certain intensity
- jquery.js
##### Style
- css.css
##### Interactivity
- interactivity.js - solutions to all the interactivity and visualizations

#### Folder templates
- layout.html - to have ability to improve this web-app, add new pages etc.
- index.html - all the things happen here

#### Web-application
  - application.py - sets routes, does some logic, manages data flow and forms a model of a JSON object

#### Helper files
  - analyser.py - implements sentiment analysis of each tweet
  - helpers.py - works with Twitter API and parses received data

#### Dictionaries

  Used for implementing sentiment analysis
  http://www.cs.uic.edu/~liub/FBS/sentiment-analysis.html
  - negative-words.txt
  - positive-words.txt

#### Requirements
  - requirements.txt

#### Readme
  - README.md


--------------------------------
This project's code is based on
guidance and starter code from a hometask project Sentiments
that was in previous year's version of the course @CS50
(https://docs.cs50.net/problems/sentiments/sentiments.html)

Current web-app is completely reworked, it solves different problems

New features:

1. A model of a complex nested JSON object

      It is used to pass user's timeline and sentiments statistics to the client side as a single object

2. Visualizations via D3.js
    - bar chart of total sentiments

      Based on bar chart by Marcos Iglesias
      https://bl.ocks.org/Golodhros/6f8e6d1792416ee3770ff4ddd5c9594e
    - heatmap calendar of daily sentiment score

      Based on heatmap calendar of Dan Joseph
      https://bl.ocks.org/danbjoseph/13d9365450c27ed3bf5a568721296dcc

3. All the interactivity with Javascript, jQuery:
    - customized form validation
    - event prevention

      Based on a solution of Medium user @uistephen
      https://medium.com/@uistephen/keyboardevent-key-for-cross-browser-key-press-check-61dbad0a067a
    - Ajax GET request

      Used for passing user inputs to application.py, receiving JSON object from server and rendering the visualizations to the same HTML page
