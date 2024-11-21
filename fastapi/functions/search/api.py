# ================== NLP LIBRARIES ================== #

import json
import requests
import re
from PIL import Image
import pytesseract
from textblob import TextBlob
from PyPDF2 import PdfReader
from nltk.tokenize import word_tokenize
from nltk.corpus import wordnet, stopwords
from collections import defaultdict
from gensim import corpora
from gensim.models.ldamodel import LdaModel
from sklearn.feature_extraction.text import TfidfVectorizer
import spacy
from spacy.lang.en.stop_words import STOP_WORDS
from string import punctuation
from heapq import nlargest
import nltk
import eng_to_ipa as ipa
from nltk.tokenize import word_tokenize
from nltk.corpus import wordnet as wn
from nltk.stem import WordNetLemmatizer
from gensim import corpora
from nltk.sentiment import SentimentIntensityAnalyzer
from concurrent.futures import ThreadPoolExecutor

# ================== MODELS ================== #

nltk.download('brown')
nltk.download('vader_lexicon')
nltk.download('stopwords')
nltk.download('averaged_perceptron_tagger')


class NLP_API:

    def __init__(self):

        self.text = ''
        self.summary = ''
        self.paragraphs = []
        self.sentiments = []
        self.definitions = defaultdict(str)
        self.keywords = []
        self.topic = ''

    def extract_text(self, file):

        extension = file.split('.')[-1]

        if extension == 'pdf':
            with open(file, 'rb') as f:
                pdf_reader = PdfReader(f)
                for page_num in range(len(pdf_reader.pages)):
                    page = pdf_reader.pages[page_num]
                    self.text += page.extract_text()

        elif extension in ['png', 'jpg']:
            img = Image.open(file)
            self.text = pytesseract.image_to_string(img)

        elif extension in ['doc', 'docx']:
            with open(file, 'r') as f:
                self.text = f.read()

        return self.text

    def extract_topic(self, text, num_topics=1, num_words=3):

        try:
            stop_words = set(stopwords.words("english"))
            words = word_tokenize(text)

            # Filter words for nouns and adjectives only
            tagged_words = nltk.pos_tag(words)
            valid_tags = ('NN', 'NNS', 'JJ', 'JJR', 'JJS')
            words = [word.lower() for word, pos in tagged_words if
                     word.isalnum() and pos in valid_tags and word not in stop_words]

            # Lemmatize words
            lemmatizer = WordNetLemmatizer()
            words = [lemmatizer.lemmatize(word) for word in words]

            # Create a dictionary and a corpus
            dictionary = corpora.Dictionary([words])
            corpus = [dictionary.doc2bow([word]) for word in words]

            # Train an LDA model and extract topic words
            lda_model = LdaModel(corpus, num_topics=num_topics, id2word=dictionary, passes=15)
            topic_words = lda_model.show_topics(num_topics=num_topics, num_words=num_words, formatted=False)

            self.topic = [word[0].capitalize() for word in topic_words[0][1]]

        except ValueError as e:
            print(e)
            self.topic = ["Uknown"]

    def summarize_text(self, text, per=0.1):

        nlp = spacy.load('en_core_web_sm')
        doc = nlp(text)
        tokens = [token.text for token in doc]
        word_frequencies = {}
        for word in doc:
            if word.text.lower() not in list(STOP_WORDS):
                if word.text.lower() not in punctuation:
                    if word.text not in word_frequencies.keys():
                        word_frequencies[word.text] = 1
                    else:
                        word_frequencies[word.text] += 1

        max_frequency = max(word_frequencies.values()) if word_frequencies else 0
        for word in word_frequencies.keys():
            word_frequencies[word] = word_frequencies[word] / max_frequency

        sentence_tokens = [sent for sent in doc.sents]
        sentence_scores = {}
        for sent in sentence_tokens:
            for word in sent:
                if word.text.lower() in word_frequencies.keys():
                    if sent not in sentence_scores.keys():
                        sentence_scores[sent] = word_frequencies[word.text.lower()]
                    else:
                        sentence_scores[sent] += word_frequencies[word.text.lower()]

        select_length = int(len(sentence_tokens) * per)
        summary = nlargest(select_length, sentence_scores, key=sentence_scores.get)
        final_summary = [word.text for word in summary]

        self.summary = ''.join(final_summary)

    def divide_into_paragraphs(self):

        self.paragraphs = re.split('\n\n|\n\t|\n', self.text)

    def perform_sentiment_analysis(self):

        def get_sentiment_description(score):

            if score >= 0.5:
                return "Very Positive"
            elif score > 0.1:
                return "Positive"
            elif score > -0.1:
                return "Neutral"
            elif score > -0.5:
                return "Negative"
            else:
                return "Very Negative"

        sia = SentimentIntensityAnalyzer()

        for paragraph in self.paragraphs:
            sentiment_score = sia.polarity_scores(paragraph)['compound']
            sentiment = get_sentiment_description(sentiment_score)
            self.sentiments.append(sentiment)

    def extract_definitions(self, word):

        def pos_to_human_readable(pos_tag):

            if pos_tag == 'n':
                return 'noun'
            elif pos_tag == 'v':
                return 'verb'
            elif pos_tag == 'a':
                return 'adjective'
            elif pos_tag == 's':
                return 'adjective satellite'
            elif pos_tag == 'r':
                return 'adverb'
            else:
                return 'unknown'

        def get_example_sentence(keyword, pos):

            from nltk.corpus import brown
            tagged_sentences = brown.tagged_sents(categories='news')

            for sent in tagged_sentences:
                for idx, (token, tag) in enumerate(sent):
                    if token.lower() == keyword.lower() and pos_to_human_readable(tag[0].lower()) == pos:
                        return ' '.join([token for token, _ in sent])

            return 'No example available'

        synsets = wordnet.synsets(word)

        if synsets:
            definition = synsets[0].definition()
            pos = pos_to_human_readable(synsets[0].pos())
            pronunciation = ipa.convert(word)
            example = get_example_sentence(word, pos)

            return {
                'part_of_speech': pos,
                'definition': definition,
                'pronunciation': pronunciation,
                'example': example
            }

    def divide_into_paragraphs(self):

        self.paragraphs = re.split('\n\n|\n\t|\n', self.text)

    def tag_keywords(self):

        def is_number_string(s):
            return s.replace('.', '', 1).isdigit()

        def get_keywords(paragraph, num_keywords):

            try:
                stop_words = list(set(stopwords.words("english")))
                vectorizer = TfidfVectorizer(stop_words=stop_words, token_pattern=r'(?u)\b[A-Za-z]+\b')
                tfidf_matrix = vectorizer.fit_transform([paragraph])
                feature_names = vectorizer.get_feature_names_out()
                importance = tfidf_matrix.toarray()[0]

                # Use a heap to store the top N keywords
                top_keywords = []

                import heapq
                for index, value in enumerate(importance):
                    word = feature_names[index]
                    if not is_number_string(word):
                        if len(top_keywords) < num_keywords:
                            heapq.heappush(top_keywords, (value, word))
                        else:
                            heapq.heappushpop(top_keywords, (value, word))

                # Extract keywords from the heap
                return [word for _, word in sorted(top_keywords, reverse=True)]

            except ValueError:
                return []

        paragraph_keywords = []

        for paragraph in self.paragraphs:
            paragraph_length = len(word_tokenize(paragraph))
            num_keywords = min(max(paragraph_length // 10, 2), 5)
            keywords = get_keywords(paragraph, num_keywords)
            paragraph_keywords.append({keyword: self.extract_definitions(keyword) for keyword in keywords})

        self.keywords = paragraph_keywords

    def process_file(self, file_path):

        text = self.extract_text(file_path)
        self.summarize_text(text)
        self.divide_into_paragraphs()
        self.perform_sentiment_analysis()
        self.tag_keywords()
        self.extract_topic(text)

    def to_json(self, data='all', file_path=None):

        json_dict = {

            'topic': self.topic,
            'summary': self.summary,
            'paragraphs': [{"text": paragraph, "sentiment": sentiment, "keywords": keywords} for
                           (paragraph, sentiment, keywords) in
                           zip(self.paragraphs, self.sentiments, self.keywords)],
        }

        if file_path is not None:
            with open(file_path, 'w') as f:
                json.dump(json_dict, f)

        return json.dumps(json_dict)