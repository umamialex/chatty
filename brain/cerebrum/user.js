var bcrypt = require('bcrypt-nodejs');

module.exports = function(bookshelf) {
    var User = bookshelf.Model.extend({
        idAttribute: 'email',
        tableName: 'users',
        hashPassword: function(password) {
            return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
        },
        validatePassword: function(password) {
            return bcrypt.compareSync(password, this.get('password'));
        },
        createMessagesTable: function(done) {
            var self = this;
            bookshelf.knex.schema.createTable(self.get('email').replace('@', 'at').replace(/\./g, 'dot') + '-messages', function(table) {
                table.increments();
                table.text('email');
                table.boolean('mine');
                table.text('message');
                table.boolean('read').defaultTo(false);
                table.timestamps();
            }).then(function() {
                done(null, self);
            });
        }
    });

    return User;
};
