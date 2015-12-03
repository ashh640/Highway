(function() {

    function HomeViewModel() {
    }

    HomeViewModel.prototype.init = function(element) {
        //this will be called when page is navigated to
    }

    HomeViewModel.prototype.destroy = function() {
        //this is called when page is left
    }

    highway.configureRoutes({
        routes: [{
            state: 'home',
            template: 'pages/home/home.html',
            viewmodel: new HomeViewModel()
        }, {
            state: 'gettingstarted',
            template: 'pages/gettingstarted/gettingstarted.html'
        }],
        default: 'home'
    });
})();
