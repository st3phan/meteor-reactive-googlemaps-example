Places = new Mongo.Collection('places');

if (Meteor.isClient) {
    var lookup = [];

    Meteor.startup(function() {
        GoogleMaps.load();
    });

    Template.map.onCreated(function() {
        var self = this;

        GoogleMaps.ready('map', function(map) {
            self.autorun(function() {
                getBox();

                var handle = Meteor.subscribe('places', Session.get('box'));
                if (handle.ready()) {
                    var places = Places.find().fetch();

                    _.each(places, function(place) {
                        var lat = place.location.coordinates[0];
                        var lng = place.location.coordinates[1];

                        if (!_.contains(lookup, lat+','+lng)) {
                            var marker = new google.maps.Marker({
                                position: new google.maps.LatLng(lat, lng),
                                map: GoogleMaps.maps.map.instance
                            });
                            lookup.push(lat+','+lng);
                        }
                    });
                }
            });

            google.maps.event.addListener(map.instance, 'dragend', function(e){
                 getBox();
            });

            google.maps.event.addListener(map.instance, 'zoom_changed', function(e){
                 getBox();
            });
        });
    });

    Template.map.helpers({
        mapOptions: function() {
            if (GoogleMaps.loaded()) {
                return {
                    center: new google.maps.LatLng(52.370216, 4.895168),
                    zoom: 14
                };
            }
        },
        places: function() {
            return Places.find();
        }
    });

    function getBox() {
        var bounds = GoogleMaps.maps.map.instance.getBounds();
        var ne = bounds.getNorthEast();
        var sw = bounds.getSouthWest();
        Session.set('box', [[sw.lat(),sw.lng()], [ne.lat(),ne.lng()]]);
    }
}

if (Meteor.isServer) {
    Meteor.publish('places', function(box) {
        var find = {
            location: {
                $geoWithin: {
                    $box: box
                }
            }
        };

        return Places.find(find);
    });

    Meteor.startup(function() {
        var data = [
            {
                "name": "Nieuwmarkt, Amsterdam",
                "location": {
                    "type": "Point",
                    "coordinates": {
                        "lat": 52.372466,
                        "lng": 4.900722
                    }
                }
            },
            {
                "name": "Waterlooplein, Amsterdam",
                "location": {
                    "type": "Point",
                    "coordinates": {
                        "lat": 52.368078,
                        "lng": 4.902281
                    }
                }
            },
            {
                "name": "Anne Frank Huis, Amsterdam",
                "location": {
                    "type": "Point",
                    "coordinates": {
                        "lat": 52.375218,
                        "lng": 4.883977
                    }
                }
            },
            {
                "name": "Dappermarkt, Amsterdam",
                "location": {
                    "type": "Point",
                    "coordinates": {
                        "lat": 52.362222,
                        "lng": 4.927778
                    }
                }
            },
            {
                "name": "Westergas, Amsterdam",
                "location": {
                    "type": "Point",
                    "coordinates": {
                        "lat": 52.385946,
                        "lng": 4.875867
                    }
                }
            },
            {
                "name": "Ransdorp, Amsterdam",
                "location": {
                    "type": "Point",
                    "coordinates": {
                        "lat": 52.392954,
                        "lng": 4.993593
                    }
                }
            },
        ];

        if(!Places.find().count()) {
            _.each(data, function(place) {
                Places.insert({
                    name: place.name,
                    location: {
                        type: 'Point',
                        coordinates: [
                            place.location.coordinates.lat,
                            place.location.coordinates.lng
                        ]
                    }
                })
            });
        }
    });
}
