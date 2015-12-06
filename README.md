#HighwayJS

## Demo Page

Check out the following link to see a sample application that uses HighwayJS:
[Demo App](http://beginninghere.co.uk/highway/) 

## Getting Started

HighwayJs is designed to be incredibly simple! Just follow a few simple steps to get started!

#### Step One

Create a basic html page and load the highway.js script. You should also have a <span style="color: #007700"><div></span> that has an attribute called <span style="color: #0000CC">highway-view</span>. This will be where each page will be displayed.

```html
<!DOCTYPE html>
<html>

<head>
    <title>Highway JS - Example Page</title>
    <link href='https://fonts.googleapis.com/css?family=Open+Sans:400,700' rel='stylesheet' type='text/css'>
    <link href="style.css" rel="stylesheet">
</head>

<body>
    <div class="navigation">
        <img class="logo" src="img/logo.png">
        <ul class="nav-list">
            <li class="nav-item"><a href="#home">Home</a></li>
            <li class="nav-item"><a href="#gettingstarted">Getting Started</a></li>
        </ul>
    </div>

    <div class="container" highway-view></div>

    <script type="text/javascript" src="../src/highway.js"></script>
    <script type="text/javascript" src="index.js"></script>
</body>

</html>
```

#### Step Two

Create any HTML files required for each of your pages. Create a javascript file to set up the routes.

```javascript
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
```


Use **highway.configureRoutes** to set up the routes. It should receive an object with a routes property which will be an array of route objects, and a property called default which will define the state to go to when one was not specified.  

A **route** object must have a **state** property. This is a string that is essentially the name of the page. This will be displayed in the url.  

You also need a **template** property which is the reference to the HTML file for that view.  

An additional **viewmodel** property may be defined that allows a you to set up and tear down a view once it has been displayed.  

The view model should have an **init** function which should accept one argument which will contain the root element contained in the template.  

Another function called **destroy** can be defined that will be called once a page is left. This allows you to cleanup anything specific to the view.

#### Step Three

To navigate between views simply use an **a** tag and set the **href** to **#state**.

#### That is all there is to it!
