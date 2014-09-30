var http = require('http');
var express = require('express');
var app = express();
var server = http.createServer(app);
var path = require('path');
var io = require('socket.io')(server);
var passport = require('passport');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var flash = require('connect-flash');

const KNEX = {
    client: 'pg',
    connection: {
        host: '127.0.0.1',
        user: 'alex',
        password: 'alex',
        database: 'chattydb',
        charset: 'utf8'
    },
    debug: true
};

var knex = require('knex')(KNEX);
var bookshelf = require('bookshelf')(knex);
require('./cerebrum/passport.js')(passport, bookshelf);

var ChatMessage = require('./cerebrum/chat-message.js')(bookshelf);

const DIRECTORIES = {
skeleton: path.dirname(__dirname) + '/skeleton',
    skin: path.dirname(__dirname) + '/skin',
  muscle: path.dirname(__dirname) + '/muscle'
};

const EXPRESS = {
    engine: 'jade',
    port: 8080,
    routes: {
        '/': function(request, response) {
            response.render('spine');
        },
        '/signup': passport.authenticate('local-signup', {
            successRedirect: '/signup/success',
            failureRedirect: '/signup/failure'
        }),
        '/signup/success': function(request, response) {
            response.json({ success: true });
        },
        '/signup/failure': function(request, response) {
            response.json({ success: false });
        }
    },
    isLoggedIn: function(request, response, next) {
        if (request, response, next) {
            if (request.isAuthenticated()) {
                return next();
            }
        }
    },
    config: function() {
        app.use('/skin', express.static(DIRECTORIES.skin));
        app.use('/muscle', express.static(DIRECTORIES.muscle));
        app.set('views', DIRECTORIES.skeleton);
        app.set('view engine', EXPRESS.engine);

        app.use(cookieParser());
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: true }));

        app.use(session({ secret: 'thisismysecret' }));
        app.use(passport.initialize());
        app.use(passport.session());
    }
};

function init() {
    EXPRESS.config();

    for (var route in EXPRESS.routes) {
        if (typeof EXPRESS.routes[route] === 'function') {
            app.all(route, EXPRESS.routes[route]);
        } else {
            for (var type in EXPRESS.routes[route]) {
                var middleware, execute;
                if (typeof EXPRESS.routes[route][type] === 'function') {
                    middleware = function(request, response, next) { next(); };
                    execute = EXPRESS.routes[route][type];
                } else {
                    middleware = EXPRESS.routes[route][type].middleware;
                    execute = EXPRESS.routes[route][type].execute;
                }
                app[type](route, middleware, execute);
            }
        }
    }

    server.listen(EXPRESS.port);

    io.on('connection', function(socket) {
        socket._chatty = {};

        socket.on('handshake', function() {
            socket.emit('handshake');
        });

        socket.on('chat client login', function(email) {
            socket._chatty.email = email;
            socket.join(email);
            socket.emit('chat server login success');
        });

        socket.on('chat client join', function(email) {
            socket.join(email);
        });

        socket.on('chat client message', function(data) {
            var clients = io.sockets.adapter.rooms[data.to];
            var keys = Object.keys(clients);

            for (var i = 0; i < keys.length; i++) {
                var clientId = keys[i];
                var clientSocket = io.sockets.connected[clientId];

                if (clientSocket._chatty.email === data.from || clientSocket._chatty.email === data.to) {
                    var mine = data.from === clientSocket._chatty.email;

                    var chatData = {
                        email: mine ? data.to : data.from,
                        mine: mine,
                        message: data.message
                    };

                    clientSocket.emit('chat server message', chatData);
                    var chatMessage = new ChatMessage(chatData);
                    chatMessage.tableName = clientSocket._chatty.email.replace('@', 'at').replace(/\./g, 'dot') + '-messages';
                    chatMessage.save().then(function() { console.log('saved') });
                }
            }
        });

        socket.on('chat client request unread', function() {
            knex(socket._chatty.email.replace('@', 'at').replace(/\./g, 'dot') + '-messages').where({
                read: false
            }).then(function(messages) {
                for (var i = 0; i < messages.length; i++) {
                    var message = messages[i];
                    socket.emit('chat server message', message);
                }
            });
            /*var chatMessage = new ChatMessage({ read: false });
            chatMessage.tableName = socket._chatty.email.replace('@', 'at').replace(/\./g, 'dot') + '-messages';
            chatMessage.query({ where: { read: false }}).fetchAll().then(function(chatMessages) {
                chatMessages.forEach(function(message) {
                });
            });*/
        });
    });
}

init();
