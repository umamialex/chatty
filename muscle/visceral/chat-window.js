var $ = require('jquery');
        require('jquery-ui');

var AmpersandModel = require('ampersand-model');
var AmpersandView = require('ampersand-view');
var AmpersandCollection = require('ampersand-collection');
var ChatMessage = require('./chat-message.js');

var ChatMessageCollection = AmpersandCollection.extend({
    model: ChatMessage
});

var ChatWindowView = AmpersandView.extend({
    autoRender: true,
    render: function() {
        this.renderWithTemplate(this);
        $(this.el).draggable({
            grid: [ 16, 16 ],
            stack: '.chat-window'
        });
        return this;
    },
    template: function() { return $('#templates .chat-window').clone()[0]; },
    bindings: {
        'model.name': {
            type: 'text',
            selector: '.name'
        },
        'model.to': {
            type: 'text',
            selector: '.email'
        },
        'model.pending': {
            type: 'booleanAttribute',
            name: 'disabled',
            selector: 'input'
        }
    },
    events: {
        'submit form': 'reply'
    },
    reply: function(event) {
        event.preventDefault();

        var message = $(event.target).find('input[type="text"]').val();

        this.model.context.socket.emit('chat client message', {
            to: this.model.to,
            from: this.model.from,
            message: message
        });

        this.model.pending = true;
    }
});

var ChatWindowModel = AmpersandModel.extend({
    idAttribute: 'to',
    props: {
        name: 'string',
        to: 'string',
        from: 'string',
        view: 'object',
        chatMessageCollection: 'object',
        context: 'object',
        pending: 'boolean'
    },
    initialize: function() {
        this.view = new ChatWindowView({ model: this });
        $('body').append(this.view.el);

        this.chatMessageCollection = new ChatMessageCollection();

        this.on('change:pending', function(model, value) {
            if (!value) {
                $(model.view.el).find('input[type="text"]').val('');
            }
        });
    }
});

module.exports = ChatWindowModel;
