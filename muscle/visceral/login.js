var $ = require('jquery');
        require('jquery-ui');

var Section = require('./section.js');

var LoginView = Section.View.extend({
    template: function() { return $('#login')[0]; },
    bindings: {
        'model.pending': {
            type: 'booleanAttribute',
            name: 'disabled',
            selector: 'input'
        }
    },
    events: {
        'submit form': 'login'
    },
    login: function(event) {
        event.preventDefault();
        var self = this;

        var form = $(event.target);

        this.model.email = form.find('input[name="email"]').val();
        this.model.name = form.find('input[name="name"]').val();
        this.model.password = form.find('input[name="password"]').val();
        this.model.pending = true;

        $.post('/signup', {
                email: this.model.email,
                name: this.model.name,
                password: this.model.password
            }, function(response) {
                if (response.success) {
                    self.model.context.socket.emit('chat client login', self.model.email);

                    self.model.context.dashboard.email = self.model.email;
                    self.destroy(self.model.context.dashboard);
                } else {
                    self.model.pending = false;
                    form.effect('shake', { times: 2, distance: 10 });
                }
            }
        );
    }
});

var LoginModel = Section.Model.extend({
    props: {
        email: 'string',
        name: 'string',
        pending: 'boolean'
    },
    initialize: function() {
        this.view = new LoginView({ model: this });
    }
});

module.exports = LoginModel;
