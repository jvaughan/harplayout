function handleChange (subval) {
    // form.key.value = 'zzd';
    document.forms[0].js_submit.value = subval;
    document.forms[0].submit(); 
}

function makeTT (id, header, html) {
    document.observe('dom:loaded', function() {
    
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

    });
}