UberFlimsSF
==========
A map showing all the filming locations for movies in San Francisco with autocomplete searching. 

Feature Set
-----------
- BackendLess
  - Build just using REST API's to get it done.
  - No images are hosted other than the logo and a missing movie image
  - All locations are fetched via REST API and not stored in a DB or local storage
- AutoComplete
  - Case-insensitive auto complete movie results.
  - Autocomplete prefix is shown bolded in autocomplete results.
  - Autocomplete results are navigateable by using the keyboard and submitting enter (no mouse needed).
  - Autocomplete results are also available with pure mouse usage.
  - Autocomplete results are cached to minimize delay pinging the movie API.
- Map
  - Map is zoomed to extents of markers on the map. 
  - Map is navigateable with GUI controls.
  - Map is navigable with scrolling and panning with mouse.
- Markers
  - Markers are only shown if in San Francisco.
  - Location address is shown on all markers.
  - Street view preview is shown on all markers.
- Street View
  - Street view is shown in a modal window when clicked on the street view preview in the marker.
  - Street view orientates itself to the same preview image in the marker.
- Design 
  - Simple, clean UI that matches uber.com color scheme.  
  - Movie details are shown for currently searched film (Title, Year, Production Company, Director, Writer)
  - Movie thumbnail is shown for currently searched film from Rotten Tomatoes.

Tech Spec
---------
- CSS
- HTML
- Javascript
- JQuery
- Google Maps API
- Google Street view API
- Rottentomatoes API
- DataSF Film Locations API

Additional Features
-------------------
- Added image results from Rotten Tomatoes.
- Added current searched film details 
- Added street view preview on markers
- Added street view panorama for marker locations.

Other projects
------------------
http://www.vidsocially.com/jorge

http://www.amigoster.com/bets (Really old and dated but massive feature set) 


