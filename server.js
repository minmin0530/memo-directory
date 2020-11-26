const express = require('express');
const app = express();
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;
const http = require('http').Server(app);
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');


const url = 'mongodb://localhost:27017';
const dbName = 'memomongo';
const connectOption = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}

app.use(cookieParser());
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 60 * 1000
  }
}));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());


const regist = async (res, data) => {
    let client;
    try {
      client = await MongoClient.connect(url, connectOption);
      const db = client.db(dbName);
      const collection = db.collection('directory');
  
      const a = await collection.updateOne({name:data.name, can:data.can}, {$set:data}, true );
      if (a.result.n == 0) {
        const b = await collection.insertOne(data);
      }  
      await res.redirect('/home');
    } catch (error) {
      console.log(error);
    } finally {
//      client.close();
    }
}
const download = async (res) => {
    console.log("download");
    let client;
    try {
      client = await MongoClient.connect(url, connectOption);
      const db = client.db(dbName);
      const collection = db.collection('directory');
  
      const a = await collection.find({}).toArray();
      await res.json(a);
    } catch (error) {
      console.log(error);
    } finally {
//      client.close();
    }

}
app.get('/style.css', (req, res) => { res.sendFile(__dirname + "/style.css"); });
app.get('/api', (req, res) => {
    download(res);
});
app.post('/regist', (req, res) => {
    console.log(req.body.name);
    console.log(req.body.can);
    regist(res, {name: req.body.name, can: req.body.can});
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/index.html");
});
app.get('/home', (req, res) => {
    if (req.session.account == "abc" && req.session.password == "memo") {
        res.sendFile(__dirname + "/home.html");
    } else {
        res.sendFile(__dirname + "/loginerror.html");
    }
});
app.post('/home', (req, res) => {
    if (req.body.account == "abc" && req.body.password == "memo") {
        req.session.account = req.body.account;
        req.session.password = req.body.password;
        res.sendFile(__dirname + "/home.html");
    } else {
        res.sendFile(__dirname + "/loginerror");
    }
});

http.listen(8080, () => {
    console.log("listen ... :8080");
});