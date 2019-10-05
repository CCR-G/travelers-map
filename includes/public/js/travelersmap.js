document.addEventListener("DOMContentLoaded", function(event) { 
	
	/**
	 * Get plugin options from database
	*/
	

	//Get plugin options from the database, set in the setting page.
	var json_cttm_options = cttm_options_params.cttm_options;


	//Retrieve and store all shortcodes data arrays sent by php in "cttm_shortcode_vars_arr"
	var cttm_shortcode_vars_arr = new Array();

	
	//Search for every js variable beginning with "cttm_shortcode_"
	var cttm_varname_pattern = /^cttm_shortcode_/;
	for (var cttm_varName in window){
		if(cttm_varname_pattern.test(cttm_varName)){
			cttm_shortcode_vars_arr.push(window[cttm_varName]);
		}
	}

	/**
	 * Loop : Create a new map for each shortcode in the page
	 */
	cttm_shortcode_vars_arr.forEach(cttmMapLoop);

	function cttmMapLoop(cttm_shortcode_vars){
		//Get shortcode options
		var json_cttm_shortcode = cttm_shortcode_vars.cttm_shortcode_options;

		//Clean json string to be usable
		json_cttm_options = json_cttm_options.replace(/&quot;/g, '"');
		json_cttm_shortcode = json_cttm_shortcode.replace(/&quot;/g, '"');

		//Get arrays of all the options and shortcode options
		cttm_options = JSON.parse(json_cttm_options);
		cttm_shortcode_options = JSON.parse(json_cttm_shortcode);
		
		/**
		 * Create leaflet map options array
		 */
		cttm_map_options = new Object();

		// If one-finger touch event is disabled on mobile
		if (cttm_options['onefinger']) {
			cttm_map_options.dragging = !L.Browser.mobile;
			cttm_map_options.tap = !L.Browser.mobile
		}
		//Set maxzoom if defined
		if (cttm_shortcode_options.maxzoom != "") {
			cttm_map_options.maxZoom = cttm_shortcode_options.maxzoom;
		}
		//set minzoom if defined
		if (cttm_shortcode_options.minzoom != "") {
			cttm_map_options.minZoom = cttm_shortcode_options.minzoom;
		}


		/**
		 * Create leaflet map object "cttm_map"
		 */
		
		//Get cttm_map container id
		var containerid = cttm_shortcode_options.id;
		var container = document.getElementById('travelersmap-container-'+containerid);
		//Index of map objects in array
		var mapindex = 0;

		//Create cttm_map array of object
		var cttm_map = new Array();
		cttm_map.push(L.map(container, cttm_map_options));
		
		
		//Get Tiles server URL + API key + Attribution
		L.tileLayer(cttm_options['tileurl'], {
			subdomains: cttm_options['subdomains'],
			attribution: cttm_options['attribution']
		
			}).addTo(cttm_map[mapindex]);


		/**
		 * Disable Scrollwheel zoom when map is not in focus
		 */
		cttm_map[mapindex].scrollWheelZoom.disable();
		//Enable Scrollwheel Zoom on focus
		cttm_map[mapindex].on('focus', function (e) {
		   this.scrollWheelZoom.enable();
		});

		/**
		 * Show warning message on single touch event if option is enabled
		 * This code is still in progress. Touch events seems to not work properly in leaflet...
		 */
		
		// if (cttm_options['onefinger']) {
		// 	console.log("one finger true");
		// 	var warningopened = false;
		// 	//On touch, check if the user is using two fingers. 
		// 	//If not, show an overlay message
		// 	cttm_map[mapindex].on("touchstart", function(e) {
		// 	  if (e.touches.length !== 2) {
		// 	  	console.log("Deux doigt start");
		// 	    warningopened = true;
		// 	    container.addClass('is-showing');
			    
		// 	  }else{
		// 	  	 console.log("Pas deux doigt start");
		// 	  }
		// 	});
		// 	cttm_map[mapindex].on("touchmove", function(e) {
		// 	  if (e.touches.length !== 2) {
		// 	  	console.log("Deux doigt move");
		// 	    warningopened = true;
		// 	    container.addClass('is-showing');
			    
		// 	  }else{
		// 	  	 console.log("Pas deux doigt move");
		// 	  }
		// 	});
		// 	cttm_map[mapindex].on("touchend", function(e) {
		// 	  if (warningopened == true) {
		// 		console.log("End opened");
		// 		  container.removeClass('is-showing');
		// 	      warningopened = false;
		// 	  }else{
		// 	  	console.log("End not opened");
		// 	  }
		// 	});
		// }
		
		
		/**
	   	* Create all markers and popups, and add them to the leaflet map.
	   	*/
	   
	   	//Change default leaflet icon options 
		L.Icon.Default.prototype.options.iconSize = [32, 45];
		L.Icon.Default.prototype.options.iconAnchor = [16, 45];
		L.Icon.Default.prototype.options.popupAnchor = [0, -42];
		L.Icon.Default.prototype.options.shadowSize = [0,0];

		//Create a Leaftlet Cluster Group, so we can add our markers in it
			var markerscluster = L.markerClusterGroup({
				spiderfyOnMaxZoom: false,
				showCoverageOnHover: false,
				maxClusterRadius: 45
			});

		
		//Define popup class and create HMTL output for popups depending of style set in plugin settings
		switch(cttm_options['popup_style']){
				case "img_title_descr": 
					var popupOptions = { 'className' : 'thumb-title-exc-popup' };
					var popupOutput = '<a class="tooltip-link" href="%s_url">';
			        popupOutput += '<div class="nothumbplaceholder"></div>';
					popupOutput += '<div class="title">%s_title</div></a>';
					popupOutput += '<div class="excerpt">%s_excerpt</div>';
				break;


				case "title_descr":
					var popupOptions = { 'className' : 'title-exc-popup' };
			       
					var popupOutput = '<a class="tooltip-link" href="%s_url">';
					popupOutput += '<div class="title">%s_title</div>';
					popupOutput += '<div class="excerpt">%s_excerpt</div></a>';
				break;


				default:
					var popupOptions = { 'className' : 'default-popup' };
					
					var popupOutput = '<div class="img-mask">';
			        popupOutput += '<div class="nothumbplaceholder"></div>';
					popupOutput += '</div><a class="tooltip-link" href="%s_url">';
					popupOutput += '<div class="title">%s_title</div></a>';

			}
		//If css is disabled, change popup class
		if (cttm_options['popup_css']) {		
			popupOptions = { 'className' : 'custom-popup' };
		}


		//Get markers metas and linked posts datas from shortcode
		var json_cttm_metas = cttm_shortcode_vars.cttm_metas;

		//If posts with markers exist
		if (json_cttm_metas!=0){
			//Clean json string to be usable
			json_cttm_metas = json_cttm_metas.replace(/&quot;/g, '"');
			
			//Get an array of objects containing markerdatas and postdatas
			cttm_metas = JSON.parse(json_cttm_metas);
			
			//Loop through cttm_metas array, create all the markers and popups.
		    for (var i = 0; i < cttm_metas.length; i++) {
		    	
		    	//Get markerdatas object
		        var markerdatas = JSON.parse(cttm_metas[i].markerdatas);
				
		        //Initialize all markers variables
		        var markerlatitude = markerdatas.latitude;
		        var markerlongitude = markerdatas.longitude;
		        var markerURL = markerdatas.markerdata[0];
		        var markerwidth = markerdatas.markerdata[1];
		        var markerheight = markerdatas.markerdata[2];

		        //Get linked postdatas object
		        var postdatas = cttm_metas[i].postdatas;
		        
		        //Initialize all linked posts variables for popups
		        var postthumb = postdatas.thumb;

		        var posturl = postdatas.url;
		        var posttitle = postdatas.thetitle;

		        var postexcerpt = postdatas.excerpt;

		        var postpopupOutput = popupOutput;

		        // Create a leaflet icon object and add it to the map, use default
		        
		        if (markerURL!="d") {
		        	
		        	//Create custom icon
		        	var myIcon = L.icon({
					    iconUrl: markerURL,
					    iconSize: [markerwidth, markerheight],
					    iconAnchor: [markerwidth/2, markerheight],
					    popupAnchor: [0, -markerheight+3]
					});
					//Create marker object wih our icon
					var marker = L.marker( [markerlatitude, markerlongitude], {
						icon: myIcon
					});
					
		        }else{
		        	//Create marker object with default icon
					var marker = L.marker( [markerlatitude, markerlongitude]);
					
		        }

		        

		        //Replace output dynamic contents for this post
				if (postthumb) {
					postpopupOutput = postpopupOutput.replace('<div class="nothumbplaceholder"></div>', '<img src="'+postthumb+'" alt="">');
				}
				if (postexcerpt){
					postpopupOutput = postpopupOutput.replace('%s_excerpt', postexcerpt);
				}else{
					postpopupOutput = postpopupOutput.replace('%s_excerpt', "");
				}

		        postpopupOutput = postpopupOutput.replace('%s_title', posttitle);
		       postpopupOutput = postpopupOutput.replace('%s_url', posturl);

		       
				//Add the marker in our cluster group layer with its popup
		        markerscluster.addLayer(marker.bindPopup(postpopupOutput,popupOptions));

		    } //END For Loop through cttm_metas 

		    //add Leaflet.search to the map when option is checked
		    if (cttm_options['search_field']==1) {
		    	
				cttm_map[mapindex].addControl( new L.Control.Search({
					url: 'https://nominatim.openstreetmap.org/search?format=json&q={s}',
					jsonpParam: 'json_callback',
					propertyName: 'display_name',
					propertyLoc: ['lat','lon'],
					autoCollapse: false,
					collapsed: false,
					autoType: true,
					minLength: 2,
					zoom: 13,
					firstTipSubmit:true,
					hideMarkerOnCollapse : true
				}) );

				//On focus, enable zoom with mousewheel on map.
				document.querySelector('#searchtext9').addEventListener('focus', function () {
				    cttm_map[mapindex].scrollWheelZoom.enable();
					},true);
		   		};
		   	

		    //add markercluster layer to the map
		  	cttm_map[mapindex].addLayer(markerscluster);

		  	cttm_map[mapindex].fitBounds(markerscluster.getBounds(),{
		  		padding: [60,60]
		  	});
		  	//Get all markers on the map
		  

		} //END if (!json_cttm_metas)
		mapindex++;
	} // END FUNCTION cttmMapLoop()
	
	
});


