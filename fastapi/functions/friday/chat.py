import random
import json
import torch
import spacy
import os

from .model import NeuralNet
from .nltk_utils import bag_of_words, tokenize
# from asistant_funt import extract_app_name

import torch.multiprocessing as mp

# Ustaw metodę startową na 'spawn'
# mp.set_start_method('spawn', force=True)

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

with open('functions/friday/intents.json', 'r') as f:
    intents = json.load(f)

FILE = 'functions/friday/data.pth'
data = torch.load(FILE)

input_size = data["input_size"]
hidden_size = data["hidden_size"]
output_size = data["output_size"]
all_words = data["all_words"]
tags = data["tags"]
model_state = data["model_state"]

model = NeuralNet(input_size, hidden_size, output_size).to(device)
model.load_state_dict(model_state)
model.eval()

bot_name = 'friday'
# print("Let's chat type 'quit' to exit")
# while True:
#     respons = ''
#     sentence = input("You: ")
#     if sentence == "quit":
#         break
#     message = sentence
#
#     sentence = tokenize(sentence)
#     X = bag_of_words(sentence, all_words)
#     X = X.reshape(1, X.shape[0])
#     X = torch.from_numpy(X).to(device)
#
#     output = model(X)
#     _, prdicted = torch.max(output, dim=1)
#
#     tag = tags[prdicted.item()]
#
#     probs = torch.softmax(output, dim=1)
#     prob = probs[0][prdicted.item()]
#
#     if prob.item() > 0.85:
#         for intent in intents['intents']:
#             if tag == intent["tag"]:
#                 respons = random.choice(intent["responses"])
#                 print(f'{bot_name}: {respons}')
#     else:
#         print(f"{bot_name}: I don't understand...")

def Friday_chat(sentence):
    respons = ''
    message = sentence

    sentence = tokenize(sentence)
    X = bag_of_words(sentence, all_words)
    X = X.reshape(1, X.shape[0])
    X = torch.from_numpy(X).to(device)

    output = model(X)
    _, predicted = torch.max(output, dim=1)

    tag = tags[predicted.item()]

    probs = torch.softmax(output, dim=1)
    prob = probs[0][predicted.item()]

    if prob.item() > 0.85:
        for intent in intents['intents']:
            if tag == intent["tag"]:
                respons = random.choice(intent["responses"])
                return f'{respons}'
    else:
        return f"I don't understand..."