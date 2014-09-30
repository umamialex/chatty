var io = require('socket.io-client');
var Login = require('./login.js');
var Dashboard = require('./dashboard.js');
var ChatWindow = require('./chat-window.js');

var Chatty = function() {
    var self = this;

    self.socket = io.connect();

    self.socket.emit('handshake');

    self.socket.on('handshake', function() {
        self.login = new Login({ context: self });
        self.dashboard = new Dashboard({ context: self });

        self.login.view.render();
    });
};

module.exports = Chatty;
