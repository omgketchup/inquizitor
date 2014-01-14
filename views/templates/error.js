<!doctype html>
<html xmlns:ng="http://angularjs.org" id="ng-app" ng-app="app" class="no-js" lang="en">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Inquizitor - Some kind of tagline.</title>

    <link rel='stylesheet' href='/vendor/foundation/css/normalize.css' />
    <link rel='stylesheet' href='/vendor/bootstrap/bootstrap.min.css' />
    <link rel='stylesheet' href='/vendor/foundation/css/foundation.min.css' />
    <link rel="stylesheet" href="/fonts/foundation-icons.css">
    <link rel='stylesheet' href='/stylesheets/animate.css' />
    <link rel='stylesheet' href='/stylesheets/stylish.css' />
  </head>
  <body>
    
<!-- Navigation -->
 
 
  <!-- End Top Bar -->
  <div class='row app-content'>
    <div class='large-12 columns'>
      <div ui-view>
      </div>
    </div>


    <!--
    <a ui-sref='home'>Home</a> 
    <a ui-sref='list'>List</a>
    <div ui-view>-->

    </div>
  </div>


    <script type='text/javascript' src='/vendor/angular/angular.min.js'></script>
    <script type='text/javascript' src='/vendor/angular/angular-animate.min.js'></script>
    <script type='text/javascript' src='/vendor/ui-router/ui-router.js'></script>
    <script src="http://code.angularjs.org/1.2.7/angular-sanitize.min.js"></script>
    <script type='text/javascript' src='/javascripts/quiztaker.js'></script>
  </body>
</html>