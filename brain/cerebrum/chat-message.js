module.exports = function(bookshelf) {
    var ChatMessage = bookshelf.Model.extend({
        idAttribute: 'id'
    });

    return ChatMessage;
};
