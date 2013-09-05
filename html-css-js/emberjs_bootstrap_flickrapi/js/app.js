// APPLICATION
App = Ember.Application.create();

// MODEL
App.Photo = Ember.Object.extend({
    url: null,
    title: null,
    description: null
});

// VIEW
App.SearchTextField = Em.TextField.extend({
    insertNewline: function(){
        App.flickrController.searchPhotos();
    }
});

// CONTROLLER
App.flickrController = Ember.ArrayController.create({
    content: [],
    searchTerm: '',
    searchPhotos: function() {
        var me = this;
        var term = me.get("searchTerm");
        if (term) {
            var url = App.getFlickrURL(term);
            App.recentSearchesController.addSearchTerm(term);
            $.getJSON(url, this._parseJsonResponse);
        }
    },
    _parseJsonResponse: function(json) {
        App.flickrController.clear();
        $(json.photos.photo).each(function (index, value) {
            var p = App.Photo.create({
                url: value.url_q,
                title: value.title,
                description: value.description._content
            });
            App.flickrController.pushObject(p);
        });
    }

});

App.recentSearchesController = Ember.ArrayController.create({
    content: [],
    addSearchTerm: function(term) {
        if (this.contains(term))
            this.removeObject(term);
        this.pushObject(term);
    },
    // when calling from view using action, ember will pass a reference to the current view
    // this view has a context attribute, which happens to be the controller item being iterated over
    removeSearchTerm: function(view) {
        this.removeObject(view.context);
    },
    searchAgain: function(view) {
        App.flickrController.set('searchTerm', view.context);
        App.flickrController.searchPhotos();
    },
    reverse: function() {
        return this.toArray().reverse();
    }.property('@each')
});

App.getFlickrURL = function (term) {
    var url = 'http://www.flickr.com/services/rest/?method=flickr.photos.search';
    var apiKey = '&api_key=1709289c1c309fbc4f88707cbc6bf972';
    var tags = '&tags=' + term;
    var media = '&media=photos'; // photos
    var pageSize = '&per_page=12';
    var pageIndex = '&page=1';
    var format = '&extras=url_q,description&format=json&nojsoncallback=1';
    return url + apiKey + tags + media + pageSize + pageIndex + format;
}
