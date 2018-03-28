const express = require('express');
const app = express();
const handlebars = require('express-handlebars');
const firebase = require('firebase');

var config = {
  apiKey: "AIzaSyCTXy3Pvx_0bWbDhjyJ4gYxz5gpRswvsxs",
  authDomain: "platformer-74c54.firebaseapp.com",
  databaseURL: "https://platformer-74c54.firebaseio.com/",
  storageBucket: "platformer-74c54.appspot.com",
  messagingSenderId: "583391834790",
};
firebase.initializeApp(config);

// var ref = firebase.database().ref('/' + 0);
// ref.on('value', function(snapshot) {
//   // console.log(snapshot.val().coins);
// });

app.use(express.static("assets"));
app.engine('handlebars', handlebars({
  defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

app.get('/', function (req, res) {
    res.render("home");
})

app.listen(3000, function () {
  console.log('Platformer listening on port 3000!');
})
