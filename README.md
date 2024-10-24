<p align="center">
    <img src="/repo/scr/logo.png" width="50%" alt="echo">
</p>

<h1 align="center">echo project - server</h1>

---

<h5>Server program created for echo project. </h5>
This server use Echo app.

# Licensing
This project is published under the [GNU General Public License](https://github.com/antekes1/echo_project_server/blob/main/LICENSE.txt).
You can use code from this project as long as you disclose the source of your work. For more details, view LICENSE.

# Features
- Web ui
- User registration & login
- Uploading and downloading files form storage
- Managing storages, sharing storage

# In Development / Planned

- intelligent files searching
- add ai

# Building

<h5> In linux: </h5> 
Download the source code using:

```bash
git clone https://github.com/anetkes1/ehco_project_server
```

cd into repo directory and run:

```bash
pip install -r requirements.txt
```
*tip, create env
<h5>and then: </h5>
```bash
cd fastapi/
uvicorn main:app --reload
```
<h4>*Remember you must enter a URL_DATABASE, SECRET_KEY and ALGORITM to your env. You can specify it in settings.py too</h4>
<h5>Your database must be mysql server. </h5> 

# Bug Reports / Feature Suggestions

You can [open an issue](https://github.com/antekes1/echo_project_server/issues) 
or you can join our [discord](https://discord.gg/dRMjjtWjdc)
