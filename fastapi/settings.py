import os
from dotenv import load_dotenv
# if env in different directory
#dotenv_path = Path('path/to/.env')
load_dotenv()
url_database = os.getenv("URL_DATABASE")
algorithm = str(os.getenv("ALGORITM"))
secret_key_token = str(os.getenv("SECRET_KEY"))
storages_path = 'files/storages/'
archives_files_path = 'files/archive/'