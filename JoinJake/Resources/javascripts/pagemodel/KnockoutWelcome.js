var WelcomeModel = function () {
    var self = this;

    //PROPERTIES
    self.Map;
    self.Markers = ko.observableArray();
    self.MapOptions = {
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    self.YouAreHere;
    self.Var = ko.observable();
    self.Var(4);
    self.PlaceReference = ko.observable();
    self.PlaceContent = ko.observable();
    self.MarkerIcon = ko.observable();
    self.PlaceLocation = ko.observable();
    self.PlaceImage = ko.observable();
    self.PlaceMarker = ko.observable();
    self.PlaceRequest = ko.observable();
    self.PlaceService = ko.observable();
    self.PlaceReviews = ko.observableArray();
    self.Place = ko.observable();

    self.Place(new PlaceModel());

    //METHODS
    self.LoadMap = function() {
        self.Map = new google.maps.Map(document.getElementById('map_canvas'),
            self.MapOptions);

        // Try HTML5 geolocation
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                var pos = new google.maps.LatLng(position.coords.latitude,
                    position.coords.longitude);
                self.YouAreHere = new google.maps.Marker({
                    position: pos,
                    map: self.Map,
                    animation: google.maps.Animation.DROP,
                    title: "You are here",
                    icon: "/Resources/images/youarehere.png"
                });
                self.Map.setCenter(pos);
            }, function() {
                HandleNoGeoLocation(true);
            });
        } else {
            // Browser doesn't support Geolocation
            self.HandleNoGeoLocation(false);
        }
    };

    self.HandleNoGeoLocation = function(errorFlag) {
        if (errorFlag) {
            var content = 'Error: The Geolocation service failed.';
        } else {
            var content = 'Error: Your browser doesn\'t support geolocation.';
        }

        var options = {
            map: self.Map,
            position: new google.maps.LatLng(60, 105),
            content: content
        };

        var infowindow = new google.maps.InfoWindow(options);
        self.Map.setCenter(options.position);
    }

    self.SetAllMap = function() {
        if(self.Markers != undefined){
            for (var i = 0; i < self.Markers.length; i++) {
                self.Markers[i].setMap(self.Map);
            }
        }
    }

    self.DeleteOverlays = function() {
        self.SetAllMap();
        self.Markers = [];
    }

    self.CallBack = function(results, status, pagination ) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            for (var i = 0; i < results.length; i++) {
                self.CreateMarker(results[i]);

                if (pagination.hasNextPage) {
                    pagination.nextPage();
                };
            }
        }
    }

    self.AssignPlaceImage = function(place) {
        if ($.inArray('bar', place.types) > -1) {
            return "/Resources/images/bar.png";
        } else if ($.inArray('night_club', place.types) > -1) {
            return "/Resources/images/club.png";
        } else if ($.inArray('food', place.types) > -1) {
            return "/Resources/images/food.png";
        } else if ($.inArray('restaurant', place.types) > -1) {
            return "/Resources/images/food.png";
        } else if ($.inArray('lodging', place.types) > -1) {
            return "/Resources/images/sleep.png";
        } else if ($.inArray('establishment', place.types) > -1) {
            return "/Resources/images/sleep.png";
        }
    };

    self.ClearInfoBox = function(){
        if ($('#infobox') != undefined) {
            $('#infobox').remove();
            $('.infobox-wrapper').remove();
            $('.infoBox').remove();
        };
    };

    self.BuildInfoBoxContent = function(place) {
        var contentString = "<div id=\infobox\>" + "<b>" + place.name + "</b>" + "<div id=\"hiddenreference\" style=\"display:none\">" +
            place.reference.toString() + "</div>";
        if (place.rating != undefined) {
            contentString = contentString + "</p>Rating - " + place.rating + "/5";
        }
        if (place.icon != undefined) {
            contentString = contentString + "</p>" + "<img src=\"" + self.MarkerIcon() + "\"height=\"40\" width=\"40\"" + "\">";
        }
        if (place.types != undefined) {
            contentString = contentString + "</p>" + place.types;
            contentString = contentString.replace(",establishment", "").replace("night_club", "night club");
        }
        if (place.opening_hours != undefined) {
            if (place.opening_hours.open_now != true) {
                var openClosed = "This place is currently closed, wait until it opens";
            } else {
                openClosed = "This place is currently open, go check it out";
            }
            contentString = contentString + "</p>" + openClosed;
        }
        contentString = contentString;
        contentString = contentString + "</p>" + "<a class=\"myModalPlace\" onclick=\"vm.PopulatePlaceModal()\"><i class=\"icon-barcode\"></i> More Information?</a>";

        return contentString;
    };

    self.CreateMarker = function(place) {
        //set our places location
        self.PlaceLocation(place.geometry.location)
        //set the marker icon we will use to display on the map and infoBox
        self.MarkerIcon(self.AssignPlaceImage(place));
        //set our place image
        self.PlaceImage({
            url: self.MarkerIcon(),
            size: new google.maps.Size(71, 71),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(17, 34),
            scaledSize: new google.maps.Size(25, 25)
        });
        //set up our place marker
        self.PlaceMarker(new google.maps.Marker({
            map: self.Map,
            position: place.geometry.location,
            icon: self.PlaceImage()
        }));
        //add it to our array
        self.Markers.push(self.PlaceMarker());
        //add our handler, this is provided by google and means if we mouse over a place location it will pop up the infoBox
        var markerHandler = google.maps.event.addListener(self.PlaceMarker(), 'click', function () {
            //clear existing info box
            self.ClearInfoBox();
            //set the ko var place ref that we use to load the place details with later.
            self.PlaceReference(place.reference);
            //build the content string we use to populate the infoBox
            self.PlaceContent(self.BuildInfoBoxContent(place));
            //now set up the infoBox
            var infoBox = new InfoBox({
                content: self.PlaceContent(),
                disableAutoPan: false,
                maxWidth: 150,
                pixelOffset: new google.maps.Size(0, 0),
                zIndex: null,
                boxStyle: {
                    background: "white",
                    width: "280px"
                },
                closeBoxMargin: "10px 10px",
                closeBoxURL: "/Resources/images/close.png",
                infoBoxClearance: new google.maps.Size(1, 1),
                pane: "floatPane"
            });
            //open the infoBox
            infoBox.open(self.Map, this);
        });
    };

    self.Search = function(type){
        if(self.Map.getBounds()){
            self.DeleteOverlays();
            var request = {
                bounds: self.Map.getBounds(),
                types: [type]
            };
            infowindow = new google.maps.InfoWindow();
            var service = new google.maps.places.PlacesService(self.Map);
            service.nearbySearch(request, self.CallBack);
        }
    }

    self.SetUpReviews = function(place) {
        //loop through the reviews and set up our place review object then push it to the ko array.
        for (var i = 0; i < place.reviews.length; i++) {
        var placeReview = new PlaceReview(place.reviews[i]);
            self.PlaceReviews().push(placeReview);
        }
    };

    self.PlaceDetailsCallBack = function(place, status){


        if (status == google.maps.places.PlacesServiceStatus.OK) {
            //do crap to get us reviews
            if (place.reviews != undefined) {
                self.SetUpReviews(place);
            }
            else {
                $('#jjreviews').append("<div class=\"alert alert-warning\">There are no reviews! Oh dear.</div>");
            }

            //do crap to get opening hours this should be a seperate function at some point or better...
            var sunday = "Not available";
            var monday = "Not available";
            var tuesday = "Not available";
            var wednesday = "Not available";
            var thusday = "Not available";
            var friday = "Not available";
            var saturday = "Not available";
            var isthisplaceopen = false;
            if (place.opening_hours != undefined) {
                isthisplaceopen = true;
                if (place.opening_hours.periods[0] != undefined)
                    sunday = place.opening_hours.periods[0].open.time + " - " + place.opening_hours.periods[0].close.time;
                if (place.opening_hours.periods[1] != undefined)
                    monday = place.opening_hours.periods[1].open.time + " - " + place.opening_hours.periods[1].close.time;
                if (place.opening_hours.periods[2] != undefined)
                    tuesday = place.opening_hours.periods[2].open.time + " - " + place.opening_hours.periods[2].close.time;
                if (place.opening_hours.periods[3] != undefined)
                    wednesday = place.opening_hours.periods[3].open.time + " - " + place.opening_hours.periods[3].close.time;
                if (place.opening_hours.periods[4] != undefined)
                    thusday = place.opening_hours.periods[4].open.time + " - " + place.opening_hours.periods[4].close.time;
                if (place.opening_hours.periods[5] != undefined)
                    friday = place.opening_hours.periods[5].open.time + " - " + place.opening_hours.periods[5].close.time;
                if (place.opening_hours.periods[6] != undefined)
                    saturday = place.opening_hours.periods[6].open.time + " - " + place.opening_hours.periods[6].close.time;
            }

            self.Place(new PlaceModel(place));

            //now the places website, again needs making better?
            var website = null;

            var myPlaceModel = {
                //contact type info
                placeWebsite: website,
                placeURL: place.url,
                placeName: place.name,
                placeAddress: place.formatted_address,
                placeNumber: place.formatted_phone_number,
                //opening times
                openSunday: sunday,
                openMonday: monday,
                openTuesday: tuesday,
                openWednesday: wednesday,
                openThursday: thusday,
                openFriday: friday,
                openSaturday: saturday
            };

            $('address').text(myPlaceModel.placeAddress);
            $('#phonenumber').text(myPlaceModel.placeNumber);
            $('#openinghours table tbody tr td.sunday').text(myPlaceModel.openSunday)
            $('#openinghours table tbody tr td.monday').text(myPlaceModel.openMonday)
            $('#openinghours table tbody tr td.tuesday').text(myPlaceModel.openTuesday)
            $('#openinghours table tbody tr td.wednesday').text(myPlaceModel.openWednesday)
            $('#openinghours table tbody tr td.thursday').text(myPlaceModel.openThursday)
            $('#openinghours table tbody tr td.friday').text(myPlaceModel.openFriday)
            $('#openinghours table tbody tr td.saturday').text(myPlaceModel.openSaturday)

            if (isthisplaceopen == true) {
                $('#openinghours').show();
            } else {
                $('#openinghours').hide();
            }
            $('#myModalPlace').modal('show');
            $('.myModalPlace').unbind();
        } else {
            console.log(status);
        }
    };

    self.PopulatePlaceModal = function() {
        //set up our place request with our place reference
        self.PlaceRequest({
            reference: self.PlaceReference()
        });
        //set up our service
        self.PlaceService(new google.maps.places.PlacesService(self.Map));
        //fire of the request to get the place details
        self.PlaceService().getDetails(self.PlaceRequest(), self.PlaceDetailsCallBack);
    };

    //INIT CALLS
    self.LoadMap();
};

ko.applyBindings(new WelcomeModel());
var vm = ko.dataFor(document.body);

