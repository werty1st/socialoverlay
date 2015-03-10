angular.module("wrtyuitab", [] )
.directive('showTab', function() {
        return {
            templateUrl: "./js/tabs/tabs.html",
            link: function (scope, element, attrs) {

                angular.element(document).find('head').prepend('<style type="text/css">@charset "UTF-8"; .tab-content{ padding-top: 2em; } </style>');


                var lis = element.find("li");
                var content_divs = element.find("ul").next().find("div");

                angular.forEach(lis, function(li, key) {
                    li.onclick = function(){
                        var _e = element;
                        var _li = li;
                        return function(e){
                            var mylis = _e.find("li");

                            angular.forEach(lis, function(li, key) {
                                if (_li == li){
                                    angular.element(li).addClass("active");
                                    angular.element(content_divs[key]).addClass("active");
                                } else {
                                    angular.element(li).removeClass("active");
                                    angular.element(content_divs[key]).removeClass("active");
                                }

                            });
                        }
                    }();                
                });
            }
        }
    });


/*
        <div show-tab>
            <ul id="tabs" class="nav nav-tabs" data-tabs="tabs">
                <li class="active"><a href="" data-toggle="tab">Red</a></li>
                <li ><a href="" data-toggle="tab">Orange</a></li>
                <li ><a href="" data-toggle="tab">Yellow</a></li>
                <li ><a href="" data-toggle="tab">Green</a></li>
                <li ><a href="" data-toggle="tab">Blue</a></li>
            </ul>
            <div id="my-tab-content" class="tab-content">
                <div class="tab-pane active">
                    <h1>Red</h1>
                    <p>red red red red red red</p>
                </div>
                <div class="tab-pane">
                    <h1>Orange</h1>
                    <p>orange orange orange orange orange</p>
                </div>
                <div class="tab-pane">
                    <h1>Yellow</h1>
                    <p>yellow yellow yellow yellow yellow</p>
                </div>
                <div class="tab-pane">
                    <h1>Green</h1>
                    <p>green green green green green</p>
                </div>
                <div class="tab-pane">
                    <h1>Blue</h1>
                    <p>blue blue blue blue blue</p>
                </div>
            </div>
        </div>*/