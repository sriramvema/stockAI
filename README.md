# Stock AI <br>
This app is a useful tool for people who are beginning to get into the stock market. Beginners might be a little lost when it comes to finding information that could affect stock prices. 
I used a webcrawler program that allows the user to search for the top 10 most relevant news articles for any stock on the Nasdaq. My React app displays these articles along with an AI-generated summary for each article as well as a comprehensive summary for all of the articles together. For this, I used Claude, and the model also generates an opinion on how this news could affect the price of the stock. This is very useful for beginners because it will allow them to make informed decisions on whether they should buy or sell their stock.

## Backend: <br>
The backend was programmed with Python using flask. This code can be found in the api directory. Use the command "flask run" to begin running the backend. You will have to change the api keys used for Anthropic to your own key in order to run.

## Frontend: <br>
The frontend was built with React. Run the command "npm start" to open the application in your browser.
