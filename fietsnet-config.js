$(function() {
    var $cfg = $('#config');

    var width, height, lat, lon, 
        title="Fietsnet Routeplanner", 
        centername="Home!", 
        flashWarning="Flash niet beschikbaar", 
        citySelectorLabel="Zoek gemeente";

    // --------- PRODUCE OUTPUT
    var $res = $cfg.find("#result");
    function regenerate() {
        if (!latLng) {
            $res.val("<html><body>\nNiet beschikbaar zonder geldige locatie-coordinaat\n</body></html>");
            return;
        }
        var lat = latLng.lat();
        var lng = latLng.lng();

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
        "<input id='citySelector' /> <input type='button' onclick='citySelector.select();' value='" + citySelectorLabel + "' /> \n"+
        "<div id='drivingDirections'></div>\n"+
        "<span id='makesSenseWhenRouteExists' >\n"+ 
        "\t<input type='button' onclick='fietsnetmap.clearLastWayPoint()' value='Verwijder het laatst toegevoegde traject' />\n"+
        "\t<input type='button' onclick='fietsnetmap.clearRoute();' value='Verwijder de volledige route' />\n"+
        "\t<input type='button' onclick='fietsnetmap.printRoute();' value='Print route' />\n"+
        "\t<input type='button' onclick='fietsnetmap.exportRouteAsGpx();' value='Export route als GPX' />\n"+
        "\t<input type='button' onclick='fietsnetmap.exportRouteAsKnooppunterPdf();' value='Print route op Knooppunter Pdf' />\n</span>\n"+
        "<input type='button' onclick='fietsnetmap.focus(" + lat + ","+ lng + ");' value='"+ centername + "' />\n"+
        "<script type='text/javascript' src='http://www.fietsnet.be/routeplanner/api.ashx'></script>\n" +
        "<script type='text/javascript'>\n"+
            "\tfunction onDirectionsChanged(numberOfDirections, totalDistance) {\n"+
                "\t\tdocument.getElementById('makesSenseWhenRouteExists').style.display = (totalDistance == 0) ? 'none' : 'inline';\n"+
                "\t\treturn true; \n\t}"+
            "\tvar fietsnetmap = new Fietsnet.Map({ \n"+
                "\t\telement: 'flashmap',  canNotLoadFlashMessage: '" + flashWarning + ".', \n" +
                "\t\tfocus: '"+ lat +" "+ lng + "' });\n"+
            "\tvar citySelector = new Fietsnet.CitySelector({ \n"+ 
                "\t\telement: 'citySelector', map: fietsnetmap, tableStyle: 'autocompleteTable', \n"+
                "\t\tselectedRowStyle: 'autocompleteSelectedRow', unselectedRowStyle: 'autocompleteUnselectedRow' });\n"+
            "\tvar drivingPanel = new Fietsnet.DirectionsPanel({\n"+
                "\t\telement: 'drivingDirections', map: fietsnetmap, tableStyle: 'directionsTable', \n"+
                "\t\tkmCellStyle: 'kilometerCell', onChanged: onDirectionsChanged });\n"+
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

    // ------- HEIGHT
    function setWidth( w) {
        width = w;
        echoWidthHeight();
    }
    
    var $width = $cfg.find("#width");
    $width.change( function(){
        setWidth( $(this).val() );
    });
    setWidth($width.val());

    // ------ HEIGHT
    function setHeight( h) {
        height = h;
        echoWidthHeight();
    }
    
    var $height = $cfg.find("#height");
    $height.change( function(){
        setHeight( $(this).val() );
    });
    setHeight($height.val());


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
            $echoLatLng.html("(onbekende locatie)");
        } else {
            $echoLatLng.html(""+latLng);
            marker = new google.maps.Marker({position: latLng, map: locmap});
            // locmap.setCenter(marker.getPosition()); >> makes the screen jump around in a confusing way
        }
        regenerate();
    }

    var $locmap = $cfg.find('#locmap');
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
