	var map; // Google map
	var prevResults = {}; // Caches the autocomplete results to limit request for dups
	var markers = []; // Holds all the current markers to display
	var infowindow = new google.maps.InfoWindow(); // Global var to only show one window at a time
	var searchForResults; // Timeout variable to Cancel searching when fast typing

	function initialize() {
		geocoder = new google.maps.Geocoder();
		var mapOptions = {
			zoom : 11,
			maxZoom: 17,
			minZoon: 11,
			center : new google.maps.LatLng(37.75, -122.45),
			mapTypeControl : true,
			mapTypeControlOptions : {
				style : google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
				position : google.maps.ControlPosition.RIGHT_CENTER
			},
			panControl : true,
			panControlOptions : {
				position : google.maps.ControlPosition.RIGHT_CENTER
			},
			zoomControl : true,
			zoomControlOptions : {
				style : google.maps.ZoomControlStyle.LARGE,
				position : google.maps.ControlPosition.RIGHT_CENTER
			},
			scaleControl : true,
			scaleControlOptions : {
				position : google.maps.ControlPosition.RIGHT_CENTER
			},
			streetViewControl : true,
			streetViewControlOptions : {
				position : google.maps.ControlPosition.RIGHT_CENTER
			}
		};
		
		map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
		
		google.maps.event.addListener(map, 'click', function() {
			 $('#pano').hide();
		});
	}

	google.maps.event.addDomListener(window, 'load', initialize);

	// When the search box is clicked or a new character is pressed
	$("#search-input").bind({
		click : function(event) {
			$('#pano').hide(); //Hide Street view
			var prefix = $(this).val();
			prefix = serializeInput(prefix);
			
			if (prefix in prevResults) { //If we have results for this already, show them
				buildResults(prefix, prevResults[prefix]);
			}
			
			if (prefix.length > 0) {
				$("#search-results").show();
			}
		},
		keyup : function(event) {
			$('#pano').hide(); //Hide Street view
			var prefix = $(this).val();
			prefix = serializeInput(prefix);
			
			// If there is a prefix available to search
			if (prefix.length > 0) {
				// Get some results if key up, down, or submit were not pressed
				if (event.keyCode != 38 && event.keyCode != 40 && event.keyCode != 13) {
					if (prefix in prevResults) { //If we have results for this already, show them
						buildResults(prefix, prevResults[prefix]);
					} else {
						// We dont have any cached so search for some
						clearTimeout(searchForResults); //Reset the timer if typing too fast
						searchForResults = window.setTimeout(function(){
							searchMovie(prefix);
						}, 500); // Delay searching for results so we're not overloading the api
					}
				}
			} else {
				clearTimeout(searchForResults); //If they were backspacing fast, we would need to cancel the searching
				$("#search-results").hide(); //Deleted the contents of the input text field so hide the result div
			}
		}
	});

	// Search for movie results that match a given prefix
	function searchMovie(prefix) {
		var sfgovAPI = "http://data.sfgov.org/resource/yitu-d5am.json?$select=title&$where=starts_with(title,'"+ prefix + "')&$group=title&$limit=5";
		$.getJSON(sfgovAPI, function() {
		}).done(function(json) {
			cacheResults(prefix, json); //Cache results
			buildResults(prefix, json); //Build the results
		})

		.fail(function(jqxhr, textStatus, error) {
			var err = textStatus + ", " + error;
			console.log("Request Failed: " + err);
		});
	}

	// Build the autocomplete results
	function buildResults(prefix, json) {
		$("#search-results").empty(); //Clear results

		var movies = [];
		$.each(json, function(i, value) {
			var str = highlightPrefix(prefix, value.title);
			if (i == 0) { // Mark the first one in the list selected
				movies.push("<li class=\"selected\"><a href=\"javascript:void(0);\">" + str + "</a></li>");
			} else {
				movies .push("<li><a href=\"javascript:void(0);\">" + str + "</a></li>");
			}
		});

		showResults(movies);
	}
	
	// Show the autocomplete results
	function showResults(movies){
		$results = $("#search-results");
		// If there are results, build the movie autocomplete list
		if (movies.length > 0) {
			$("<ul/>", {
				"class" : "movie-list",
				html : movies.join("")
			}).appendTo("#search-results");
			$results.show();
		} else {
			$results.hide();
		}	
	}

	// Hightlights a prefix in a movie title
	function highlightPrefix(prefix, title) {
		return title.replace(new RegExp("^(" + prefix + ")", 'i'), '<b>$1</b>');
	}
	
	// Cache JSON result
	function cacheResults(prefix, json){
		prevResults[prefix] = json;
	}

	// Converts a single string to a JSON object.  
	// This is done to cache the full movie title when clicked from the auto complete list 	
	function stringToJSON(s){
		var json = jQuery.parseJSON('[{ "title" : "'+s+'" }]');
		return json;
	}

	// When an autocomplete result is clicked, replace the search term with the full text
	$(document).on('click', '#search-results a', function(event) {
		replaceInputContent($(this));
	});
	
	// Replace the selected result in the text input field
	function replaceInputContent($obj){
		var movieTitle = $obj.text();
		$("#search-input").val(movieTitle);
		cacheResults(movieTitle, stringToJSON(movieTitle)); //Cache results
	}

	// Hide autocomplete when clicked outside the form
	$(document).mouseup(function() {
		$("#search-results").hide();
	});
	
	// Only allow certain characters as a movie title
	function serializeInput(s){
		var res  = s.replace(/[^a-z\d\s\.:\',]/gi,"");
		return res;
	}

	// Keyboard Nav the autocomplete results
	$(document).on('keydown', function(event) {
		if ($("#search-results").is(":visible") && (event.keyCode == 38 || event.keyCode == 40 || event.keyCode == 13)) {
			event.preventDefault();//Prevent the default key response

			// If up or down is pressed, remove the highlight from the current movie title
			if (event.keyCode == 38 || event.keyCode == 40) {
				$selected = $("#search-results .selected");
				$("#search-results li").removeClass("selected");
			}

			// Keyboard Up
			if (event.keyCode == 38) {
				// If there is no element before the selected one, we select the first one
				if ($selected.prev().length == 0) {
					$("#search-results li").first().addClass("selected");
				} else { // otherwise we just select the prev one
					$selected.prev().addClass("selected");
				}
			}
			
			// KeyBoard Down
			if (event.keyCode == 40) {
				// If there is no element after the selected one, we select the last one
				if ($selected.next().length == 0) {
					$("#search-results li").last().addClass("selected");
				} else { // Otherwise we just select the next one
					$selected.next().addClass("selected");
				}
			}
			
			// KeyBoard Enter
			if (event.keyCode == 13) {
				$this = $("#search-results .selected a");
				
				replaceInputContent($this);

				$("#search-results").hide();
			}
		} else {
				// KeyBoard Enter, submit the form
				if (event.keyCode == 13) {
					// Prevents from disabling the search box when just hitting enter
					if (!$("#search-input").text() == '') {
						event.preventDefault();// Prevent the default key response
						$("#search-form").submit();
					}
				}
			}
	});

	// When the submit button is pressed, search for movie locations for the current title
	$("#search-form").submit(function() {
		clearTimeout(searchForResults); //Reset the timer if typing too fast
		
		var title = $('#search-input').val();
		title = serializeInput(title);

		if(title.length > 0){
			showMovieDetails(title);
			showMoviePoster(title);
			showMarkers(title);
		}

		return false; // Cancel submit button behavior
	});
	
	function showMarkers(title){
		var sfgovAPI = "http://data.sfgov.org/resource/yitu-d5am.json?$select=locations&$where=starts_with(title,'" + title + "')&$limit=10";
		$.getJSON(sfgovAPI, function() {
		}).done(function(json) {
			var locations = [];

			//Build locations array
			$.each(json, function(i, value) {
				locations.push(value.locations);
			});

			deleteMarkers(); // Delete all markers from the map

			// Geocode location address, then add them to the map
			codeLatLng(locations, function() {
				addToMap();
				setMapToLimits(); // Sets the limits of the map to the markers
			});		
		})

		.fail(function(jqxhr, textStatus, error) {
			var err = textStatus + ", " + error;
			console.log("Request Failed: " + err);
		});	
	}
	
	// Show movie details
	function showMovieDetails(title){
		$movieDetails = $('#movie-details');
		$movieDetails.empty();
		
		var sfgovAPI = "http://data.sfgov.org/resource/yitu-d5am.json?title="+title+"&$limit=1";
		$.getJSON(sfgovAPI, function() {
		}).done(function(json) {
			if(json.length != 0){
				movie = json[0];
				$movieDetails.append('<h2>'+movie.title+' ('+movie.release_year+')</h2>');
				$movieDetails.append('<h3>'+movie.production_company+'</h3>');
				$movieDetails.append('<p><span>Director: </span>'+movie.director+'<br><span>Writer: </span>'+movie.writer+'</p>');
			}else{
				$movieDetails.append('<h2>No results for '+ title +'</h2>');
			}
			$('#movie-section').show();
		})

		.fail(function(jqxhr, textStatus, error) {
			var err = textStatus + ", " + error;
			console.log("Request Failed: " + err);
		});
	}
	
	function showMoviePoster(title){
		var apiKey = '2grd2p5sy7e5gvd8bmdsb39s';
		var flixsterAPI = 'http://api.rottentomatoes.com/api/public/v1.0/movies.json?apikey='+apiKey+'&q='+encodeURI(title)+'&page_limit=1';
		var query = title;
		
		$.ajax({
			url: flixsterAPI,
		    dataType: "jsonp",
		    success: searchCallback
		});
	}	 

	// Callback for when we get back the results
	function searchCallback(data) {
		$("#movie-section img").attr('src',''); //Reset the img src
		
		var url;
		if(data.total == 0){
			url = 'images/poster_default.gif';
		}else{
			url = data.movies[0].posters.thumbnail;
		}
		$("#movie-section img").attr('src',url);
	}

	
	
	// Show street view for this link
	$(document).on('click', '.street-view-link', function(event) {
		var lat = $(this).attr('data-lat');
		var lng = $(this).attr('data-lng');
		var location = new google.maps.LatLng(lat, lng);
		
		var panoramaOptions = {
			position: location,
			 pov: {
				heading: 45,
				pitch: 0
			}
		};
		
		var panorama = new google.maps.StreetViewPanorama(document.getElementById('pano'),panoramaOptions);
		map.setStreetView(panorama);
		$('#pano').show();
	});
	
	// Build a marker with info window
	function buildMarker(geoCodeResult){
		var marker = new google.maps.Marker({
			position : geoCodeResult.geometry.location,
		});
		
		var content = '<div id="info-content">'+
						'<a class="street-view-link" href=\"javascript:void(0);\" title="Click for Street View"'+
						'data-lat="'+ geoCodeResult.geometry.location.lat() +'"'+
						'data-lng="'+ geoCodeResult.geometry.location.lng() +'">'+
						'<img class="street-view-img" src="http://maps.googleapis.com/maps/api/streetview?size=350x120&location='+ 
						geoCodeResult.geometry.location.lat() +','+
						geoCodeResult.geometry.location.lng() +'&fov=90&heading=45&sensor=false"></a> <br>'+ 
						'<span>Street View</span>'+
						'<p>'+geoCodeResult.formatted_address+'</p>'+
					'</div>';
		
		google.maps.event.addListener(marker, 'click', function(e) {
			infowindow.setContent(content);
			infowindow.open(map, marker);
		});

		markers.push(marker);	
	}

	// Geocode locations
	function codeLatLng(locations, callback) {
		var total = locations.length;
		$.each(locations, function(i, value) {
			var address = locations[i];
			geocoder.geocode({'address' : address + ', San Francisco CA, US'}, function(results, status) {
				if (status == google.maps.GeocoderStatus.OK) {
					buildMarker(results[0]);
				} else {
					console.log('failed:' + i + ' ' + status);
				}

				if (--total == 0) {
					callback();
				}
			});
		});
	}

	// Sets the map on all markers in the array.
	function setAllMap(map) {
		for ( var i = 0; i < markers.length; i++) {
			markers[i].setMap(map);
		}
	}

	// Removes the markers from the map, but keeps them in the array.
	function clearMarkers() {
		setAllMap(null);
	}

	// Deletes all markers in the array by removing references to them.
	function deleteMarkers() {
		clearMarkers();
		markers = [];
	}

	// Set the map window to the boundry of all the markers
	function setMapToLimits() {
		var bounds = new google.maps.LatLngBounds();

		for (i = 0; i < markers.length; i++) {
			bounds.extend(markers[i].getPosition());
		}
		map.fitBounds(bounds);
	}

	// Add all markers to map
	function addToMap() {
		for ( var i = 0; i < markers.length; i++) {
			markers[i].setMap(map);

		}
	}
