/**
 * Created by naveed on 4/28/2015.
 */
var express = require('express');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var twilio = require('twilio');
var  path = require('path');

var app = express();
app.set('views', path.join(process.cwd(), 'views'));
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({    extended: true    }));
app.use(express.static(__dirname + '/public'));

var port = process.env.PORT || 8080; // set our port

var client = twilio('ACd9fc56c9a143f99aebe5d3d796978392', '99e37e9c244d492ad1f756c5bbd4fdac');
var twilio_number = '+1(940)202-8305';

var api_key = "c9e3d61b-d9a2-4404-8936-add318ab1fb5";
var appname = "chatapp";
var collection = "smscontact";
var messagesRef = require('datamcfly').init(appname, collection, api_key);
app.post('/message', function (request, response) {
    var d = new Date();
    var date = d.toLocaleString();

    messagesRef.push({
        sid: request.param('MessageSid'),
        type:'text',
        direction: "inbound",
        tstamp: date,
        fromNumber:request.param('From'),
        textMessage:request.param('Body'),
        fromCity:request.param('FromCity'),
        fromState:request.param('FromState'),
        fromCountry:request.param('FromCountry')
    });

    var resp = new twilio.TwimlResponse();
    resp.message('Thanks for the message, an agent will get back to you shortly.');
    response.writeHead(200, {
        'Content-Type':'text/xml'
    });
    response.end(resp.toString());
});

app.post('/reply', function (request, response) {
    var d = new Date();
    var date = d.toLocaleString();

    messagesRef.push({
        type:'text',
        direction: "outbound",
        tstamp: date,
        fromNumber:request.param('From'),
        textMessage:request.param('Body'),
        fromCity:'',
        fromState:'',
        fromCountry:''
    });

    client.sendMessage( {
        to:request.param('To'),
        from:twilio_number,
        body:request.param('Body')
    }, function( err, data ) {
        console.log( data.body );
    });
});

app.get('*', function(req, res) {
    res.render('home', {
        apikey:api_key,
        appname:appname,
        collection:collection
    });
});


var server = app.listen(port, function() {
    console.log('Listening on port %d', server.address().port);
});
