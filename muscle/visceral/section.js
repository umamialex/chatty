var $ = require('jquery');
        require('jquery-ui');

var AmpersandModel = require('ampersand-model');
var AmpersandView = require('ampersand-view');

var SectionView = AmpersandView.extend({
    render: function() {
        this.renderWithTemplate(this);
        $(this.el).fadeIn();
        return this;
    },
    destroy: function(next) {
        $(this.el).fadeOut(function() {
            next.view.render();
        });
    }
});

var SectionModel = AmpersandModel.extend({
    props: {
        context: 'object',
        view: 'object'
    }
});

module.exports = {
    View: SectionView,
    Model: SectionModel
}
