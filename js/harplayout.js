jQuery(document).ready(
    function() {
        fadeHarpIn();
    }
);


function handleChange (subval) {
	document.forms[0].js_submit.value = subval;
	reloadFormAndHarp();
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
