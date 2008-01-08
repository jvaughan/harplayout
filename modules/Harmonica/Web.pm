package Harmonica::Web;
use strict;

use base qw/ CGI::Application /;
use CGI::Application::Plugin::AnyTemplate;
use CGI::Application::Plugin::AutoRunmode;

use Harmonica::Layout::Table;

use Data::Dumper;

sub cgiapp_init	{
	my $self = shift;

	# Set template options
	$self->template->config(
		default_type 	=> 'TemplateToolkit',
		include_paths	=> [qw(
			../templates
			/var/vhosts/turnip.org.uk/templates 
			/Users/jvaughan/svn/jvaughan/trunk/dev/harplayout/templates
			)
		],
		
	);
}


sub showHarp : StartRunmode {
	my $self = shift;
	my $q = $self->query;
	
	my @form_fields = qw/
		calculate
		tuning position key position_key 
		include_bends include_overbends include_unnecessary_overbends
		show_notes show_intervals
		/;
				
	my %harp_params;
	
	if ( $self->submitted ) {
		foreach my $f (@form_fields) {
			next unless Harmonica::Layout::Table->can($f);
			$harp_params{$f} = $q->param($f) || 0;
		}
	}
	
	my $harp = Harmonica::Layout::Table->new( %harp_params );
	my $b = [$harp->blowNotes];	
	my %template_params = (
		harp	=> $harp,
		debug	=> Dumper($b),
	);
	
	$template_params{'calculate'} = $q->param('calculate') || 'position_key';
		
	$self->template->process('main', \%template_params);
					
	# do something here
}

sub submitted {
	my $self = shift;
	return $self->query->param('submit') ? 1 : 0;
}





1;
