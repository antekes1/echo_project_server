import spacy

nlp = spacy.load('en_core_web_sm')

def extract_app_name(sentence):
    # Przetwarzanie wypowiedzi użytkownika przy użyciu modelu spaCy
    doc = nlp(sentence)

    # Zidentyfikuj rzeczowniki, które odnoszą się do aplikacji
    app_tokens = [token.text for token in doc if token.pos_ == 'NOUN']

    # Jeśli istnieje przynajmniej jeden rzeczownik, zwróć pierwszy z nich
    if app_tokens:
        return app_tokens[0]
    else:
        return None
