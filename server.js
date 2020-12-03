const express = require('express');
const app = express();
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;
const http = require('http').Server(app);
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const fs = require('fs');
const path = require('path');
const multer = require('multer');
const uuid = require('node-uuid');
const upload = multer({ dest: './uploads'});

var logger = require('morgan');
//passportモジュールの読み込み
var passport = require('passport');
//passport-facebookモジュールの読み込み
var Strategy = require('passport-facebook').Strategy;

//先ほど作成したアプリIDを変数に代入
var FACEBOOK_APP_ID = '416330339775053';
//先ほど作成したapp secretを変数に代入
var FACEBOOK_APP_SECRET = 'f159b22cb27825c9cb56be143a6b27e5';

//passportモジュールによるシリアライズの設定
passport.serializeUser(function(user, done) {
  done(null, user);
});
//passportモジュールによるデシリアライズの設定
passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

////passport-facebookモジュールのStarategy設定
passport.use(new Strategy({
  clientID: FACEBOOK_APP_ID,
  clientSecret: FACEBOOK_APP_SECRET,
  //facebook認証をするためのページの設定(固定)
  callbackURL: "http://localhost:8000/auth/facebook/callback",
  //プロフィールのどの情報を受け取ることができるかの設定
  profileFields: ['id', 'displayName', 'photos']
},
  function (accessToken, refreshToken, profile, done) {
    //認証後にdone関数を返すために、process.nextTick関数を利用している
    process.nextTick(function () {
      console.log("@@@@@@@@@@@@@@@@@@@@");
      console.log(profile._json.picture.data);
      console.log("@@@@@@@@@@@@@@@@@@@@");
      return done(null, profile);
    });
  }
));

//アプリケーションで利用するミドルウェアの設定
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));







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





//passportのの初期化
app.use(passport.initialize());
//ログイン後のセッション管理の設定
app.use(passport.session());

// //localhost:8000/にアクセスした時にindexRouterの処理がなされる設定
// app.use('/', indexRouter);
// //localhost:8000/usersにアクセスした時にusersRouterの処理がなされる設定
// app.use('/users', usersRouter);

//localhost:8000/auth/facebookにGETアクセスした時に認証リクエストを行う設定
app.get('/auth/facebook',
  passport.authenticate('facebook')
);
//localhost:8000/auth/facebook/callbackにGETアクセスした時に処理が行われる設定
app.get('/auth/facebook/callback',
　//処理が失敗した時のリダイレクト先の設定
  passport.authenticate('facebook', {failureRedirect: '/loginerror' }),
  function(req, res) {
    console.log("!!!!!!!!!!!!!!!!!!!!!!!");
    console.log(req);
    //処理が成功した時のリダイレクト先の設定
    res.redirect('/home');
  });

// //localhost:8000/loginにアクセスした時にloginRouter処理がなされる設定
// app.get('/login', loginRouter);

// //localhost:8000/logoutにアクセスした時にlogoutRouter処理がなされる設定
// app.get('/logout', logoutRouter);


// passport.use(new FacebookStrategy({
//   clientID: FACEBOOK_APP_ID,
//   clientSecret: FACEBOOK_APP_SECRET,
//   callbackURL: "http://www.example.com/auth/facebook/callback"
// },
// function(accessToken, refreshToken, profile, done) {
//   User.findOrCreate(..., function(err, user) {
//     if (err) { return done(err); }
//     done(null, user);
//   });
// }
// ));

// passport.use(new FacebookStrategy({
//   clientID: FACEBOOK_APP_ID,
//   clientSecret: FACEBOOK_APP_SECRET,
//   callbackURL: process.env.CALLBACK_URL || "http://localhost:8000/auth/facebook/callback"
// },
// function(accessToken, refreshToken, profile, done) {
//   process.nextTick(function () {
//     return done(null, profile);
//   });
// }
// ));










const search = async (res, data) => {
    console.log(data);
    let client;
    try {
      client = await MongoClient.connect(url, connectOption);
      const db = client.db(dbName);
      const collection = db.collection('directory');
  

      reg = new RegExp(data);


      const a = await collection.find({can: reg }).toArray();
      await res.json(a);
    } catch (error) {
      console.log(error);
    } finally {
//      client.close();
    }
}

const registImg = async (res, id, imgpath) => {
    let client;
    try {
      client = await MongoClient.connect(url, connectOption);
      const db = client.db(dbName);
      const collection = db.collection('directory');
  
      await collection.findOneAndUpdate({_id: ObjectId(id)},{$set:{ imgpath:imgpath} } );
    //   await res.redirect('/home');
    } catch (error) {
      console.log(error);
    } finally {
//      client.close();
    }
}


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
const download = async (req, res) => {
    console.log("download");
    let client;
    try {
      client = await MongoClient.connect(url, connectOption);
      const db = client.db(dbName);
      const collection = db.collection('directory');
  
      const a = await collection.find({}).toArray();
      await res.json(req.user);
    } catch (error) {
      console.log(error);
    } finally {
//      client.close();
    }

}
app.get('/dist/cropper.js', (req, res) => { res.sendFile(__dirname + "/dist/cropper.js"); });
app.get('/dist/cropper.css', (req, res) => { res.sendFile(__dirname + "/dist/cropper.css"); });
app.get('/style.css', (req, res) => { res.sendFile(__dirname + "/style.css"); });
app.get('/api', (req, res) => {
    download(req, res);
});
app.post('/regist', (req, res) => {
    console.log(req.body.name);
    console.log(req.body.can);
    regist(res, {name: req.body.name, can: req.body.can});
});

app.post('/imgupload', upload.any(), function (req, res) {
    console.log(req.body.accountid);
    var fextention = path.extname(req.files[0].filename).toLowerCase();
    var tempPath = req.files[0].path;
    var newNamedFile = uuid.v4() + fextention;
    var newNamedResolvedPath = path.resolve('./uploads/'+newNamedFile);
    //Rename if you want                                                                                                                                                         
    fs.rename(tempPath, newNamedResolvedPath, function(){
        registImg(res, req.body.accountid, newNamedResolvedPath);

        res.json({status:'success'});
    });
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/index.html");
});
app.get('/home', (req, res) => {
//    if (req.session.account == "abc" && req.session.password == "memo") {
        res.sendFile(__dirname + "/home.html");
//    } else {
//        res.sendFile(__dirname + "/loginerror.html");
//    }
});
app.get('/loginerror', (req, res) => {
  res.sendFile(__dirname + "/loginerror.html");
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

app.post('/search', (req, res) => {
    console.log(req.body);
    search(res, req.body.search)
});


//404エラーの処理設定
app.use(function(req, res, next) {
  next(createError(404));
});

// エラー処理の設定
app.use(function(err, req, res, next) {
  // ローカル環境のみ表示されるエラーの設定
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // エラーページを表示する設定
  res.status(err.status || 500);
  res.render('error');
});

http.listen(8000, () => {
    console.log("listen ... :8000");
});