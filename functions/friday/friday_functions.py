import speech_recognition as sr
from webbrowser import Chrome
import pyaudio
from pynput.keyboard import Key, Controller
import pyttsx3 as tts
from gtts import gTTS
from playsound import playsound
import os, sys, time
import pywhatkit

keyboard = Controller()

recorder = sr.Recognizer()
engine = tts.init()
engine.setProperty('volume', 10)
engine.setProperty('voice', engine.getProperty('voices')[1].id)
engine.setProperty('rate', 150)

def speak(text):
    engine.say(text)
    engine.runAndWait()

def open_app(app_name):
    if app_name == 'chrome':
        os.system('start chrome')
        speak("Opening chrome")
    else:
        keyboard.press(Key.cmd)
        keyboard.release(Key.cmd)
        time.sleep(0.1)
        keyboard.type(app_name)
        time.sleep(0.1)
        keyboard.press(Key.enter)
        keyboard.release(Key.enter)
        speak('opening ' + app_name)

def play_music(title):
    speak("playing" + title)
    pywhatkit.playonyt(title)

def mute():
    keyboard.press(Key.media_volume_mute)
    keyboard.release(Key.media_volume_mute)

def shutdown_comp(command):
    if 'confirm' in command:
        speak('Turning off computer')
        os.system('shutdown -s -t 1')
    else:
        speak('Turning off not confirm')

def search(thing):
    pywhatkit.search(thing)

# def search_way(command):
#     slowo = ''
#     if 'to' in command:
#         command = command.lower()
#         ciong = command
#         przyklad = ciong.split()
#         długosc= len(przyklad)
#         print(przyklad)
#         for i in range(długosc):
#         slowo = przyklad[0]
#         if slowo != 'do':
#             przyklad.pop(0)
#         else:
#             break
#         result = ''
#         for i in przyklad:
#             result += str(i)
#             result += ' '        
#             command = result
#             command = command.replace('do', '')
#             command = command.replace(command[-1], '')
#             commend = command.replace(" ", "+").replace("?", "%3F")
#             print(command)
#         os.system('start chrome https://www.google.pl/maps/dir//' + command)
#     else:
#         os.system('start chrome https://www.google.pl/maps/')