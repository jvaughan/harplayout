function handleChange (subval) {
	document.forms[0].js_submit.value = subval;
	reloadFormAndHarp();
}

function reloadFormAndHarp () {	
	var url = '/perl/form_and_harp.pl';
	var target = '#form_and_harp';
	var formid = '#mainform';

	var qstring = jQuery(formid).serialize();
	var geturl = url + '?' + qstring;
	jQuery(target).load ( geturl );
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