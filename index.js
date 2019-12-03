const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const path = require("path");
const formidable = require("formidable");
const fs = require("fs");
const admin = require("firebase-admin");

// Local IP for internal testing
app.set("port", process.env.PORT || 5000);
var ip;

//Static Files
app.use(express.static(path.join(__dirname, "/public")));
//EJS View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

//Database connectivity
var serviceAccount = require(path.join(
  __dirname,
  "/filer-8850a-firebase-adminsdk-ponz3-211c45a9cd.json"
));
//URL
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://filer-8850a.firebaseio.com"
});

//Database Reference
var db = admin.firestore();
//Files collection reference
var files = db.collection("files");

//Home endpoint
app.get("/", function(req, res) {
  files.get().then(function(querySnapshot) {
    var homeFiles = [];
    querySnapshot.forEach(function(doc) {
      var item = doc.data();
      item.key = doc.id;
      homeFiles.push(item);
    });
    res.render("home", { docs: homeFiles });
  });
});

//Primary file upload endpoint
app.post("/uploadFile", function(req, res) {
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, file) {
    var oldpath = file.fileToUpload.path;
    var newpath = path.join(__dirname, "/files/") + file.fileToUpload.name;
    var format = path.extname(file.fileToUpload.name);
    fs.rename(oldpath, newpath, function(err) {
      if (err) {
        res.send({ status: "failure" });
        throw err;
      }
      var stats = fs.statSync(newpath);
      var fileSizeInBytes = stats["size"];
      var fileSizeInMegabytes = fileSizeInBytes / 1000000.0;
      files.doc(file.fileToUpload.name).set({
        path: newpath,
        tags: fields.tags.split(","),
        size: fileSizeInMegabytes.toPrecision(2),
        format: format
      });
      res.send({ status: "success" });
    });
  });
});

//Server Startup
require("dns").lookup(require("os").hostname(), function(err, add, fam) {
  ip = add;
  app.listen(80, function() {
    console.log("\n\n\nStarted now! Running at : " + ip + ":80");
  });
});
