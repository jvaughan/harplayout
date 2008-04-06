package HarpLayout::Webapp::FormAndHarp;
use strict;

use base qw/ HarpLayout::Webapp /;

sub processDefTmpl {
	my $self = shift;
	my $template_params = shift;
	$self->template->process('inc/form_and_harp', $template_params);
}

1;
