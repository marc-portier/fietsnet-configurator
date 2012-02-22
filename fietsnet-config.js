$(function() {
    var $cfg = $('#config');

    var width, height, lat, lon, 
        title="Fietsnet Routeplanner", 
        flashWarning="Flash niet beschikbaar", 
        opts = {
            centerButton:       true, 
            citySelector:       true,
            drivingDirections:  true,
            whenRouteExists:    true 
        },
        centerButtonLabel="Home!", 
        citySelectorLabel="Zoek gemeente";

    // --------- PRODUCE OUTPUT
    var $res = $cfg.find("#result");
    function regenerate() {
        var centerAvailable, lat, lng;
        if (latLng != null) {
            centerAvailable = true;
            lat = latLng.lat();
            lng = latLng.lng();
        }

        var res = "" + 
        "<html><head><title>" + title + "</title>\n" +
        "<style type='text/css'>\n" + 
            "\t#flashmap { width: "+ width + "px; height: " + height + "px }\n" +
            "\t.autocompleteTable { padding:0; margin:0; border:1px gray solid; font-size:8pt; border-collapse:collapse; cursor:pointer; }\n"+
            "\t.autocompleteTable td { padding:3px; }\n"+
            "\t.autocompleteSelectedRow { background-color:#ed6401; color:#fff; padding:2px;}\n"+
            "\t.autocompleteUnselectedRow { background-color:#fff; color:#000; padding:2px;}\n"+
            "\t.directionsTable { font-size:9pt; width:240px; }\n"+
            "\t.kilometerCell { text-align: right; }\n"+
           "\t#makesSenseWhenRouteExists { display: none; }\n" + 
        "</style></head><body>\n" + 

        "<div id='flashmap'></div>\n" + 

        (opts.citySelector ? 
            "<input id='citySelector' /> <input type='button' onclick='citySelector.select();' value='" + citySelectorLabel + "' /> \n" 
            : "" ) +
        (opts.drivingDirections ? 
            "<div id='drivingDirections'></div>\n"
            : "" ) +
        (opts.whenRouteExists ?
            "<span id='makesSenseWhenRouteExists' >\n" +
            "\t<input type='button' onclick='fietsnetmap.clearLastWayPoint()' value='Verwijder het laatst toegevoegde traject' />\n"+
            "\t<input type='button' onclick='fietsnetmap.clearRoute();' value='Verwijder de volledige route' />\n"+
            "\t<input type='button' onclick='fietsnetmap.printRoute();' value='Print route' />\n"+
            "\t<input type='button' onclick='fietsnetmap.exportRouteAsGpx();' value='Export route als GPX' />\n"+
            "\t<input type='button' onclick='fietsnetmap.exportRouteAsKnooppunterPdf();' value='Print route op Knooppunter Pdf' />\n</span>\n"
            : "" ) + 
        (centerAvailable && opts.centerButton ? 
            "<input type='button' onclick='fietsnetmap.focus(" + lat + ","+ lng + ");' value='"+ centerButtonLabel + "' />\n"
            : "" ) +
        "<script type='text/javascript' src='http://www.fietsnet.be/routeplanner/api.ashx'></script>\n" +
        "<script type='text/javascript'>\n"+

            "\tvar fietsnetmap = new Fietsnet.Map({ \n"+
                (centerAvailable ? "\t\tfocus: '"+ lat +" "+ lng + "',\n" : "" ) + 
                "\t\telement: 'flashmap',  canNotLoadFlashMessage: '" + flashWarning + ".'\n\t});\n"+

            (opts.whenRouteExists ?
                "\tfunction onDirectionsChanged(numberOfDirections, totalDistance) {\n"+
                    "\t\tdocument.getElementById('makesSenseWhenRouteExists').style.display = (totalDistance == 0) ? 'none' : 'inline';\n"+
                    "\t\treturn true; \n\t}" 
                : "" ) +

            (opts.citySelector ? 
                "\tvar citySelector = new Fietsnet.CitySelector({ \n"+ 
                    "\t\telement: 'citySelector', map: fietsnetmap, tableStyle: 'autocompleteTable', \n"+
                    "\t\tselectedRowStyle: 'autocompleteSelectedRow', unselectedRowStyle: 'autocompleteUnselectedRow' });\n"
                : "" ) +

            (opts.drivingDirections ? 
                "\tvar drivingPanel = new Fietsnet.DirectionsPanel({\n"+
                    (opts.whenRouteExists ?
                        "\t\tonChanged: onDirectionsChanged, \n" 
                        : "" ) +
                    "\t\telement: 'drivingDirections', map: fietsnetmap, tableStyle: 'directionsTable', \n"+
                    "\t\tkmCellStyle: 'kilometerCell'});\n"
                : "" ) +
        "</script></body></html>";

        $res.val(res);
    }
    $res.click(function() { $res.select()});

    // --------- PROCESS HEIGHT AND WIDTH
    var $echoWidthHeight = $cfg.find("#echo_width_height");
    function echoWidthHeight() {
        $echoWidthHeight.html(width + " x " + height);
        regenerate();
    }

    var $width = $cfg.find("#width");
    $width.change( function(){
        width = $(this).val();
        echoWidthHeight();
    });
    $width.change();

    var $height = $cfg.find("#height");
    $height.change( function(){
        height = $(this).val();
        echoWidthHeight();
    });
    $height.change();

    var TRUNKSIZE = 10;

    // --------- PROCESS TITLE
    var $echoTitle = $cfg.find("#echo_title");
    function echoTitle() {
        $echoTitle.html( title.substring(0, TRUNKSIZE) + (title.length > TRUNKSIZE ? "..." : "") );
        regenerate();
    }
    var $title = $cfg.find("#title");
    $title.change( function() {
        title = $(this).val();
        echoTitle();
    });
    $title.change();

    // --------- PROCESS WARNING
    var $echoFlashWarning = $cfg.find("#echo_flashWarning");
    function echoFlashWarning() {
        $echoFlashWarning.html( flashWarning.substring(0, TRUNKSIZE) + (flashWarning.length > TRUNKSIZE ? "..." : "") );
        regenerate();
    }
    var $flashWarning = $cfg.find("#flashWarning");
    $flashWarning.change( function() {
        flashWarning = $(this).val();
        echoFlashWarning();
    });
    $flashWarning.change();

    // --------- PROCESS OPTIONS
    var $echoOptions = $cfg.find("#echo_options");
    function echoOptions() {
        var optCount = 0;
        var allCount = 0;
        var opt; for (opt in opts) { if ( opts[opt] ) { optCount++ }; allCount++; }
        $echoOptions.html(optCount + "/" + allCount);
        regenerate();
    }
    var $opts=$([]);
    var opt; for (opt in opts) { 
        $opts = $opts.add('#' + opt + 'Opt');
    }
    $opts.click( function() { 
        var $this = $(this); 
        opts[$this.attr('id').replace(/Opt$/,'')]=( !!$this.attr('checked')); 
        echoOptions();  
    });
    echoOptions();

    var $centerButtonLabel = $cfg.find('#centerButtonLabel').change( function() {
        centerButtonLabel = $(this).val();
        regenerate();
    });
    $centerButtonLabel.change();

    var $citySelectorLabel = $cfg.find('#citySelectorLabel').change( function() {
        citySelectorLabel = $(this).val();
        regenerate();
    });
    $citySelectorLabel.change();
     

    // ------- LOCATTION ON MAP
    // see http://code.google.com/apis/maps/documentation/javascript/tutorial.html
    var locmap;
    var latLng, marker;
    var $echoLatLng = $cfg.find("#echo_lat_lng");
    function echoLatLng(ll) {
        latLng = ll;
        if (marker) { // remove previous flag
            marker.setMap(null);
            marker = null;
        }
        if (!latLng) {
            $echoLatLng.html("(geen locatie voor centrering)");
        } else {
            $echoLatLng.html(""+latLng);
            marker = new google.maps.Marker({position: latLng, map: locmap});
            // locmap.setCenter(marker.getPosition()); >> makes the screen jump around in a confusing way
        }
        regenerate();
    }

    var $locmap = $cfg.find('#locmap');
    var $clearLoc = $cfg.find('#clearLoc');
    $clearLoc.click( function(){ echoLatLng(); } );
    echoLatLng();
    function initMap() {
        if (locmap) { // only do this once...
            return;
        }
        var opts = {
            center: new google.maps.LatLng( 51.03794,3.092651),
            zoom: 9,
            mapTypeId: google.maps.MapTypeId.ROADMAP // alternatives: SATELLITE HYBRID TERRAIN 
        };
        locmap = new google.maps.Map($locmap[0], opts);
        google.maps.event.addListener(locmap, 'click', function(event) {
            echoLatLng(event.latLng);
        });
    }


    var $tester = $cfg.find("#tester");
    var $dialog = $("#dialog");
    $dialog.dialog({autoOpen: false, modal: true, minWidth: 850, minHeight: 650});
    $tester.click(function() {
        var $iframe = $dialog.find("iframe");
        var content = $res.val();
        var framedoc = $iframe[0].contentWindow.document;
        framedoc.open();
        framedoc.write(content);
        framedoc.close();
        $iframe.width( Math.max($(framedoc.body).width(),  width)  + 20);
        $iframe.height(Math.max($(framedoc.body).height(), height) + 20);
        $dialog.dialog('open');
    });

    $cfg.accordion();
    $cfg.bind('accordionchange', function(evt, ui){
        if(ui.newContent.attr('id') == 'tabMap') { initMap(); }
    });
});
