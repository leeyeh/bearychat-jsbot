var express = require('express');
var bodyParser = require('body-parser')
var vm = require('vm');
var util = require('util');
var _ = require('lodash');
Object.freeze(_);

var app = express();

app.use(bodyParser.json());
var AV = require('leanengine');
app.use(AV.Cloud);
const APP_ID = process.env.LC_APP_ID;
const APP_KEY = process.env.LC_APP_KEY;
const MASTER_KEY = process.env.LC_APP_MASTER_KEY;

AV.initialize(APP_ID, APP_KEY, MASTER_KEY);

app.post('/command', function (req, res) {
  console.log(req.body);
  if (req.body && req.body.text) {
    var trigger_word = req.body.trigger_word;
    var text = req.body.text;
    if (trigger_word === '/roll') {
      var ceil = (Number)(text.split(' ')[1]);
      if (!(ceil > 0)) ceil = 100;
      var result = Math.ceil(Math.random()*ceil);
      return send(req.body.user_name + ': '+  result, res);
    }
    if (trigger_word === '/run') {
      var command = text.slice(4);
      var script = new vm.Script(command, {
        timeout: 1000
      });
      var sandbox = { _ : _ };
      var result = script.runInNewContext(sandbox);
      console.log(util.inspect(result));
      return send(result, res);
    }
  }
});

var PORT = parseInt(process.env.LC_APP_PORT || 3000, 10);
app.listen(PORT, function() {
  console.log('bot is running at', PORT);
})

function send(result, res) {
  return res.end(JSON.stringify({
    text: util.inspect(result)
  }));
}
