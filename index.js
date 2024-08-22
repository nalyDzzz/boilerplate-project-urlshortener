require("dotenv").config();
const express = require("express");
const cors = require("cors");
const dns = require("node:dns");
const URL = require("url").URL;
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

let urlDatabase = [{ original_url: "https://freeCodeCamp.org", short_url: 1 }];
const setId = () => urlDatabase.length + 1;
class urlObj {
  constructor(url) {
    this.original_url = url;
    this.short_url = setId();
  }
}

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.use(express.urlencoded({ extended: false }));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

app.post("/api/shorturl", (req, res) => {
  let { url } = req.body;
  let parseUrl;
  try {
    parseUrl = new URL(url);
  } catch (err) {
    return res.json({
      error: "Invalid URL",
    });
  }
  dns.lookup(parseUrl.hostname, (err) => {
    if (err) {
      res.json({ error: "Invalid URL" });
    } else {
      const checkIfExists = urlDatabase.find((obj) => obj.original_url === url);
      if (!checkIfExists) {
        const newUrl = new urlObj(url);
        urlDatabase.push(newUrl);
        res.json(newUrl);
      } else {
        res.json(checkIfExists);
      }
    }
  });
});

app.get("/api/shorturl/:short_url?", (req, res) => {
  const { short_url } = req.params;
  console.log("id", short_url);
  const checkIfExists = urlDatabase.find(
    (obj) => obj.short_url === parseInt(short_url)
  );
  if (!short_url) {
    res.redirect("/");
  } else {
    if (!checkIfExists) {
      res.json({ error: "No short URL found for the given input" });
    } else {
      res.redirect(checkIfExists.original_url);
    }
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
