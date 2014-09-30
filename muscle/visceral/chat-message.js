var $ = require('jquery');
        require('jquery-ui');

var AmpersandModel = require('ampersand-model');
var AmpersandView = require('ampersand-view');

var ChatMessageView = {
    base: AmpersandView.extend({
        autoRender: true,
        bindings: {
            'model.message': {
                type: 'text',
                selector: 'p'
            },
            'model.read': {
                type: 'booleanClass',
                selector: 'p',
                name: 'unread'
            }
        }
    })
};

ChatMessageView.me = ChatMessageView.base.extend({
    template: function() { return $('#templates .chat-message-me').clone()[0]; }
});

ChatMessageView.recipient = ChatMessageView.base.extend({
    template: function() { return $('#templates .chat-message-recipient').clone()[0]; }
});

var ChatMessageModel = AmpersandModel.extend({
    props: {
        email: 'string',
        mine: 'boolean',
        message: 'string',
        view: 'object',
        read: {
            type: 'boolean',
            default: false
        },
        chatWindowCollection: 'object'
    },
    initialize: function(attributes) {
        this.view = attributes.mine ? new ChatMessageView.me({ model: this })
                              : new ChatMessageView.recipient({ model: this });
        $(attributes.chatWindowCollection.get(attributes.email, 'to').view.el).find('article ul').append(this.view.el);
    }
});

module.exports = ChatMessageModel;
