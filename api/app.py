from flask import Flask, jsonify, request
import json
import serpapi
import time
from bs4 import BeautifulSoup
from datetime import datetime, timedelta
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from flask_cors import CORS
import anthropic
import pandas as pd

app = Flask(__name__)
  # Enable CORS for all domains on all routes


CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})
COMPANY_NAME = ""


@app.route('/webcrawl', methods=['POST'])
def crawl():
    data = request.get_json()
    if not data or 'keyword' not in data:
        return jsonify({"error": "Please provide a 'keyword' in JSON body"}), 400

    keyword = data['keyword'].strip().lower()

    with open("tickers.json", "r", encoding="utf-8") as f:
        tickers_data = json.load(f)
    df = pd.read_csv("nasdaq-listed-symbols.csv")
    matches = df[df.apply(lambda row: row.astype(str).str.contains(keyword, case=False, na=False).any(), axis=1)]
    print(matches)

    if matches.empty:
        return jsonify({"error": "No matches found for the keyword"}), 404

    return jsonify({
        "matches": matches.to_dict(orient='records')
    })


@app.route('/select_company', methods=['POST'])
def select_company():
    data = request.get_json()
    if not data or 'company' not in data:
        return jsonify({"error": "Please provide a 'company' in JSON body"}), 400

    global COMPANY_NAME
    COMPANY_NAME = data['company']

    # Now that the company is selected, crawl for articles
    articles = find_credible_articles(10)

    if not articles:
        return jsonify({"message": f"No articles found for company '{COMPANY_NAME}'."})
    
    return jsonify({
        "company": COMPANY_NAME,
        "articles": articles
    })

def is_article_link(url):
    if not url:
        return False
    if "/video/" in url or url.endswith(".mp4"):
        return False
    if "/alerts/" in url:
        return False
    if url.rstrip("/").split("/")[-1].isdigit():
        return False
    return True

def find_credible_articles(num_results):
    start_date = (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d')
    with open("source.txt", "r") as f:
        sources = f.read()
    source_list = sources.splitlines()
    search_prompt = " OR ".join(source_list)

    query = f"{COMPANY_NAME} stock news after: {start_date} {search_prompt}"

    params = {
        "engine": "google",
        "q": query,
        "api_key": "SERPAPI KEY",
        "num": num_results
    }

    search = serpapi.search(params)
    results = search.as_dict()

    articles = []
    count = 0
    if 'organic_results' in results:
        for result in results['organic_results']:
            link = result.get("link")
            if is_article_link(link):
                articles.append({
                    "title": result.get("title"),
                    "link": link,
                    "snippet": result.get("snippet")
                })
            count += 1
    # If fewer articles than requested, optionally try to fetch more recursively
    if count < num_results and count > 0:
        added_articles = find_credible_articles(num_results - count)
        articles.extend(added_articles)
    return articles

# Other functions (fetch_article_text, summarize_text, opinion) remain unchanged
# Add them below if you want the full file, or let me know if you want me to include them
@app.route('/summary', methods=['POST'])
def summarize_articles():
    data = request.get_json()
    if not data or 'articles' not in data:
        return jsonify({"error": "Please provide 'articles' in JSON body"}), 400

    articles = data['articles']

    summaries = []
    for i, article in enumerate(articles):
        print(f"Fetching text for article {i+1}")
        text = fetch_article_text(article['link'])
        article["summary"] = "No summary available."
        if text:
            summary = summarize_text(text)
            if summary:
                summaries.append(summary)
                article["summary"] = summary
            time.sleep(2)  # Rate limiting

    # Merge all summaries into a final overview (opinion)
    final_opinion = opinion("\n\n".join(summaries))

    return jsonify({
        "summary": final_opinion,
        "articles": articles
    })

def opinion(text, max_tokens=1000):
    try:
        client = anthropic.Anthropic(api_key="ANTHROPIC API KEY")

        response = client.messages.create(
            model="claude-3-haiku-20240307",  # Or use "claude-3-haiku-20240307" for faster results
            max_tokens=max_tokens,
            temperature=0.7,
            messages=[
                {
                    "role": "user",
                    "content": f"You are a financial analyst. Given the folling summary of multiple articles of {COMPANY_NAME}, give your opinion on how this will affect the stocks of the company:\n\n{text}"
                }
            ]
        )

        return response.content[0].text.strip()

    except Exception as e:
        print(f"Summarization error: {e}")
        return None
    
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup


def fetch_article_text(url):
    try:
        chrome_options = Options()
        chrome_options.add_argument("--headless=new")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--disable-software-rasterizer")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-blink-features=AutomationControlled")
        chrome_options.add_argument("--window-size=1920,1080")
        chrome_options.add_argument("--ignore-certificate-errors")
        chrome_options.add_argument("--log-level=3")
        chrome_options.add_argument(
            "user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
        )

        driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
        driver.get(url)

        # Attempt to bypass cookie banners
        try:
            WebDriverWait(driver, 5).until(
                EC.element_to_be_clickable((By.XPATH, "//button[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'accept')]"))
            ).click()
        except:
            pass

        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "p"))
        )

        soup = BeautifulSoup(driver.page_source, 'html.parser')
        driver.quit()

        paragraphs = soup.find_all("p")
        cookie_keywords = [
            "these cookies are necessary",
            "do not sell or share",
            "targeted advertising",
            "your opt-out choice",
            "privacy preferences",
            "global privacy control",
            "iab opt-out",
            "privacy policy",
            "cookie notice"
        ]

        def is_cookie_paragraph(text):
            text_lower = text.lower()
            return any(keyword in text_lower for keyword in cookie_keywords)

        article_text = "\n".join(
            p.get_text() for p in paragraphs
            if p.get_text() and not is_cookie_paragraph(p.get_text())
        )
        return article_text.strip()

    except Exception as e:
        print(f"Failed to fetch article at {url}: {e}")
        return None



    
import anthropic

def summarize_text(text, max_tokens=300):
    print("Summarizing...")
    try:
        client = anthropic.Anthropic(api_key="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")

        response = client.messages.create(
            model="claude-3-haiku-20240307",  # Or use "claude-3-haiku-20240307" for faster results
            max_tokens=max_tokens,
            temperature=0.7,
            messages=[
                {
                    "role": "user",
                    "content": f"You are a financial analyst. Summarize the following article in 3 to 4 key bullet points:\n\n{text}"
                }
            ]
        )

        return response.content[0].text.strip()

    except Exception as e:
        print(f"Summarization error: {e}")
        return None
    

if __name__ == '__main__':
    app.run(debug=True)
