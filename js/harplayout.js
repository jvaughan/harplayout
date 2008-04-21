// Add css for javascript users.
var fileref=document.createElement("link");
fileref.setAttribute("rel", "stylesheet");
fileref.setAttribute("type", "text/css");
fileref.setAttribute("href", "/css/js_only.css");
document.getElementsByTagName("head")[0].appendChild(fileref)

jQuery(document).ready(
    function() {
        fadeHarpIn();
    }
);


function handleChange (subval) {
	document.forms[0].js_submit.value = subval;
	
	switch (subval) {
		case 'note':
			var newdis = jQuery('#show_notes').attr("checked") ? "table-cell" : "none";
			jQuery('.note').css("display", newdis);
			return;
		
		case 'interval':
			var newdis = jQuery('#show_intervals').attr("checked") ? "table-cell" : "none";
			jQuery('.interval').css("display", newdis);
			return;
		
		case 'interval_category':
			var newdis = jQuery('#show_interval_categories').attr("checked") ? "table-cell" : "none";
			jQuery('.interval_category').css("display", newdis);
			return;
		
		case 'bends':
			var newvis = jQuery('#include_bends').attr("checked") ? "visible" : "hidden";
			jQuery('.blowbend, .drawbend').css("visibility", newvis);
			return;

		case 'overbends':
			var newvis = jQuery('#include_overbends').attr("checked") ? "visible" : "hidden";
			jQuery('.overblow, .overdraw').css("visibility", newvis);
			controlOBLegend();
			return;
			
		case 'unnecessary_overbends':
			var newvis = jQuery('#include_unnecessary_overbends').attr("checked") ? "visible" : "hidden";
			jQuery('.unnecessary_overblow, .unnecessary_overdraw').css("visibility", newvis);
			controlOBLegend();
			return;
	}
	
	reloadFormAndHarp();
}

function controlOBLegend () {
	if ( jQuery('#include_overbends').attr("checked") || jQuery('#include_unnecessary_overbends').attr("checked") ) {
		jQuery('#harptable_legend .overblow').css("visibility", "visible");
	}
	else {
		jQuery('#harptable_legend .overblow').css("visibility", "hidden");
	}
}

function reloadFormAndHarp () {	
	var url = '/perl/web.pl?ajax_request=1';
	var target = '#form_and_harp';
	var formid = '#mainform';

	fadeHarpOut();

	var qstring = jQuery(formid).serialize();
	var geturl = url + '&' + qstring;
	jQuery(target).load ( geturl, function () { fadeHarpIn(); } );
}

function fadeHarpIn() {
    new Effect.Opacity('harp_table',
    {
        duration: 0.3,
        transition: Effect.Transitions.linear,
        from: 0.0, to: 1.0,
        beforeUpdate: makeHarpVis
    }
    );
}

function fadeHarpOut() {
    new Effect.Opacity('harp_table',
    {
        duration: 0.3,
        transition: Effect.Transitions.linear,
        from: 1.0, to: 0.0
    }
    );
}

function makeHarpVis () {
    ht = document.getElementById("harp_table");
    ht.style.visibility = "visible";
}

function makeTT (id, header, html) {
    if(navigator.userAgent.search(/msie/i)!= -1) {
        // Don't use scriptaculous effect on msie - not smooth
        new Tip(
	    id,
	    html,
	    {
	        title:   header,
	        className: 'harptt'
	    }
	);
    } else {
        // Non-ie Code
        new Tip(
    	    id, 
    	    html,
    	    {
    	        title:   header,
    	        effect:  'appear',
    	        duration: '0.2',
    	        className: 'harptt'
    	    }
    	);
    }
}
