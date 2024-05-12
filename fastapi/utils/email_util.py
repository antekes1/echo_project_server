import email
import smtplib
from email import encoders
from email.mime.base import MIMEBase
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import ssl
from webbrowser import get

class email_utils:
    def __init__(self):
        self.sender_email = 'hackerlolgo3@gmail.com'
        self.passwrd = 'shhcohbwgzxcgxod'
        self.smtp_serwer = 'smtp.gmail.com'
    def email_sent(self, email, topic, data):
        #koniguracja
        port = 465
        odbiorca = str(email)
        nadawca = self.sender_email
        #kod zabezpieczjący: shhcohbwgzxcgxod
        temat = str(topic)
        treść = str(data)
        wiadomość = MIMEMultipart()
        wiadomość['From'] = nadawca
        wiadomość['To'] = odbiorca
        wiadomość['Subject'] = temat
        wiadomość.attach(MIMEText(treść, "plain"))
        tekst = wiadomość.as_string()
        ssl_pol = ssl.create_default_context()
        with smtplib.SMTP_SSL(self.smtp_serwer, port, context=ssl_pol) as server:
            server.login(nadawca, self.passwrd)
            server.sendmail(nadawca, odbiorca, tekst)
        return "succes"