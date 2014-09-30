var $ = require('jquery');
        require('jquery-ui');

var AmpersandCollection = require('ampersand-collection');

var Section = require('./section.js');
var ChatWindow = require('./chat-window.js');
var ChatWindowCollection = AmpersandCollection.extend({
    model: ChatWindow
});

var DashboardView = Section.View.extend({
    template: function() { return $('#dashboard')[0]; },
    events: {
        'submit #add-chat-window': 'addChatWindow'
    },
    addChatWindow: function(event) {
        event.preventDefault();

        var email = $(event.target).find('input[type="email"]').val();

        this.model.context.socket.emit('chat client join', email);

        this.model.chatWindowCollection.add({
            to: email,
            from: this.model.email,
            context: this.model.context
        });
    }
});

var DashboardModel = Section.Model.extend({
    props: {
        email: 'string',
        name: 'string',
        chatWindowCollection: 'object'
    },
    initialize: function(attributes) {
        var self = this;

        this.view = new DashboardView({ model: this });
        this.chatWindowCollection = new ChatWindowCollection();

        attributes.context.socket.on('chat server message', function(data) {
            data.chatWindowCollection = self.chatWindowCollection;

            var chatWindow = self.chatWindowCollection.get(data.email, 'to');
            if (!chatWindow) {
                self.context.socket.emit('chat client join', data.email);
                chatWindow = self.chatWindowCollection.add({
                    to: data.email,
                    from: self.email,
                    context: self.context
                });
            }

            chatWindow.chatMessageCollection.add(data);
            chatWindow.pending = false;
        });

        attributes.context.socket.on('chat server login success', function() {
            attributes.context.socket.emit('chat client request unread');
        });
    }
});

module.exports = DashboardModel;
