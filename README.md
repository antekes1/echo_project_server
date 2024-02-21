<p align="center">

</p>

<h1 align="center">echo project - server</h1>

---

<h5>Server program created for echo project. </h5>
This server use Echo app.

# Features

- User registration & login
- Uploading and downloading files form storage

# In Development / Planned

- files searching
- add ai

# Building

<h5> In linux: </h5> 
Download the source code using:

```bash
git clone https://github.com/anetkes1/ehco_project_server
```

cd into repo directory and run:

```bash
source venv/bin/activate
uvicorn main:app --reload
```
<h4>*Remember you must enter a URL_DATABASE, SECRET_KEY and ALGORITM to your env. You can specify it in settings .py too</h4>

# Bug Reports / Feature Suggestions

You can [open an issue](https://github.com/antekes1/echo_project_server/issues)
