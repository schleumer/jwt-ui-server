var express = require('express');
var jwt = require('jsonwebtoken');
var bodyParser = require('body-parser');

var errors = {
  INVALID_VERIFICATION: 1,
}

var Bag = function (data = null) {
  this.errors = [];
  this.messages = [];
  this.data = data;
}

Bag.prototype.addError = function (message, field = "__global", code = -1) {
  this.errors = this.errors.concat({field, message, code});
  return this;
};

Bag.prototype.addMessage = function (message, field = "__global", code = -1) {
  this.messages = this.messages.concat({field, message, code});
  return this;
};

Bag.prototype.setData = function (data) {
  this.data = data;
  return this;
}

var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set('port', (process.env.PORT || 5000));

app.get('/', function(request, response) {
  response.send('pages/index');
});

app.post('/sign', function (request, response) {
  try {
    var token = jwt.sign(request.body.payload, request.body.secret, {
      noTimestamp: true,
      algorithm: request.body.algo || 'HS512'
    });

    response.send(new Bag({
      token
    }));
  } catch (ex) {
    response.send(new Bag().addError(ex.message, undefined, errors.INVALID_VERIFICATION));
  }
})

app.post('/verify', function (request, response) {
  try {
    var decoded = jwt.verify(request.body.token, request.body.secret);
    response.send(new Bag(decoded));
  } catch (ex) {
    response.send(new Bag().addError(ex.message, undefined, errors.INVALID_VERIFICATION));
  }
})

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
