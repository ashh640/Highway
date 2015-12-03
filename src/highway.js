//The MIT License (MIT)
//
//Copyright (c) 2015 Ashley Hunter
//
//Permission is hereby granted, free of charge, to any person obtaining a copy
//of this software and associated documentation files (the "Software"), to deal
//in the Software without restriction, including without limitation the rights
//to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
//copies of the Software, and to permit persons to whom the Software is
//furnished to do so, subject to the following conditions:
//
//The above copyright notice and this permission notice shall be included in all
//copies or substantial portions of the Software.
//
//THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
//SOFTWARE.

(function() {

    //values
    this.container = null;
    this.routes = null;
    this.defaultState = null;
    this.currentState = null;
    this.templateCache = null;
    this.baseUrl = null;
    this.states = null;

    //find the container element to render to
    function highwayjs() {
        //retain scope
        var self = this;

        // var containers = document.getElementsByTagName('highway-view');
        var containers = document.querySelectorAll('[highway-view]');

        if(!containers || containers.length === 0) {
            //we should have a container and we dont... inform the user
            console.log("HighwayJS - No highway-view element found");
            return;
        }

        if(containers.length > 1) {
            //we should only have one container
            console.log("HighwayJS - There should only be one highway-view element");
            return;
        }

        //we should only have one element
        self.container = containers[0];

        //initialise template cache
        self.templateCache = [];

        //record all our states
        self.states = [];

        //closure for url change
        var onUrlChange = function(event) { self.navigateToUrl(event); }

        //ensure we watch url for changes
        window.addEventListener("hashchange", onUrlChange);
    }

    highwayjs.prototype.navigateToUrl = function (event) {
        //retain scope
        var self = this;

        //get state from url
        var state = self.getStateFromUrl();

        //if state found - go to it - otherwise go to default
        self.navigateTo(state);
    };

    highwayjs.prototype.getStateFromUrl = function() {
        //retain scope
        var self = this;

        //get url
        var url = window.location.href;

        //check if state change action
        if(url.indexOf('#') === -1) return null;

        //get state from url
        var state = url.substr(url.indexOf('#') + 1);

        //check if state exists
        if(self.stateExists(state)) return state;

        //if not a state return null
        return null;
    }

    highwayjs.prototype.navigateToPrevious = function (state) {
        //retain scope
        var self = this;

        //if we have any previous states then we can pop and go back
        if(self.states.length > 0) {
            //remove last element
            self.states.pop();

            //go to previous state
            self.navigateTo(self.states[self.states.length - 1]);
        }
    };

    //configure routing
    highwayjs.prototype.configureRoutes = function (config) {
        //retain scope
        var self = this;

        //ensure routes is defined
        if(!config || config && !config.routes) throw 'HighwayJS - No routes defined';

        //ensure there is a default route
        if(!config.default) throw 'HighwayJS - Please specify a default route';

        //store routes
        self.routes = config.routes;

        //store default
        self.defaultState = config.default;

        //get current state from url
        var state = self.getStateFromUrl();

        //navigate to default
        self.navigateTo(state, function() {
            //when loaded initial page then background load all routes so quick page loading
            self.cacheAllRoutes();
        });
    };

    highwayjs.prototype.navigateTo = function (targetState, callback) {
        //retain scope
        var self = this;

        //if we are already on the current state then stop here
        if(self.currentState === targetState) return;

        //ensure state has been specified
        if(!targetState) {
            //if not go to default state
            self.navigateTo(self.defaultState, callback);
            return;
        }

        //ensure routes configured
        if(!self.routes) {
            console.log('HighwayJS - No routes configured');
            return;
        }

        //find route with state
        var foundRoute;

        //iterate through states to find the correct one
        for(var idx = 0; idx < self.routes.length; idx++) {
            var route = self.routes[idx];

            if(route.state === targetState) {
                foundRoute = route;
                break;
            }
        }

        //if we have not found go to the default route
        if(!foundRoute) {
            self.navigateTo(self.defaultState, callback);
            return;
        }

        //load route
        self.loadRoute(foundRoute, function(loadedRoute) {

            self.destroyRoute();

            //put the new page in the container
            self.container.innerHTML = loadedRoute.template;

            //push state
            self.states.push(foundRoute.state);

            //record current state
            self.currentState = foundRoute.state;

            //template should have only one root object
            if(self.container.children && self.container.children.length > 0) {
                //if more than one root object then warn user
                if(self.container.children.length > 1) {
                    console.log('HighwayJS - Template should have only one root object');
                }

                //if we have a viewmodel call it
                if(foundRoute.viewmodel && foundRoute.viewmodel.init) {
                    foundRoute.viewmodel.init(self.container.firstChild);
                }
            }

            //callback to show when finished
            if(callback) callback();
        });
    };

    highwayjs.prototype.destroyRoute = function() {
        var self = this;

        //empty container
        while (self.container.firstChild) self.container.removeChild(self.container.firstChild);

        //if no previous state then we have nothing to do
        if(!self.currentState) return;

        //find route with state
        var foundRoute;

        //iterate through states to find the correct one
        for(var idx = 0; idx < self.routes.length; idx++) {
            var route = self.routes[idx];

            if(route.state === self.currentState) {
                foundRoute = route;
                break;
            }
        }

        //if we have not found go to the default route
        if(!foundRoute) return;

        //check if we have a view model and we have a destroy function
        if(foundRoute.viewmodel && foundRoute.viewmodel.destroy) foundRoute.viewmodel.destroy();

    };

    highwayjs.prototype.stateExists = function (state) {
        var self = this;

        for(var idx = 0; idx < self.routes.length; idx++) {
            var route = self.routes[idx];

            if(route.state === state) {
                return true;
            }
        }
        return false;
    };

    //load or return cached template
    highwayjs.prototype.loadRoute = function (route, callback) {
        //retain scope
        var self = this;

        //iterate through cached routes - try and find template - if not then load it
        var foundCache;

        for(var idx = 0; idx < self.templateCache.length; idx++) {
            var cachedRoute = self.templateCache[idx];

            if(cachedRoute.state === route.state) {
                foundCache = cachedRoute;
                break;
            }
        }

        //if we have found a cached template then our work is done
        if(foundCache) {
            if(callback) callback(foundCache);
            return;
        }

        //ensure template has been specified
        if(!route.template) {
            console.log('HighwayJS - No template specified for "' + route.state + '"');
            return;
        }

        //if no cache then load, cache and callback
        self.loadTemplate(route.template, function (result) {

            //create cache object
            var cacheObject = {
                state: route.state,
                template: result,
                viewmodel: route.viewmodel
            };

            //cache template
            self.templateCache.push(cacheObject);

            //callback
            if(callback) callback(cacheObject);
        });
    };

    //background cache all templates when idle
    highwayjs.prototype.cacheAllRoutes = function () {
        //retain scope
        var self = this;

        //iterate all routes
        for(var idx = 0; idx < self.routes.length; idx++) {

            //get current route
            var route = self.routes[idx];

            //load route
            self.loadRoute(route);
        }
    };

    //ajax loader for loading templates
    highwayjs.prototype.loadTemplate = function(url, callback) {

        //create request
        var xhttp = new XMLHttpRequest();

        //wait for loading to be completed
        xhttp.onreadystatechange = function() {
            if (xhttp.readyState == 4 && xhttp.status == 200) {
                if(callback) callback(xhttp.responseText);
                return;
            }
        };

        // start loading
        xhttp.open("GET", url, true);
        xhttp.send();
    };

    //store in global variable
    highway = window.highway = new highwayjs();

})();

//global variable
var highway;
