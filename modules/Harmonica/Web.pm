package Harmonica::Web;
use strict;

use define DEBUG => 1;

use Switch;
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
			)
		],
		TemplateToolkit => {
			POST_CHOMP => 2,
		},
	);
}


sub showHarp : StartRunmode {
	my $self = shift;
	my $q = $self->query;
	
	my @form_fields = qw/
		tuning position key position_key 
		include_bends include_overbends include_unnecessary_overbends
		show_notes show_intervals show_interval_categories
		/;
				
	my %harp_params;
	
	if ( $self->submitted ) {
		foreach my $f ( @form_fields ) {
			next unless Harmonica::Layout::Table->can($f);
			$harp_params{$f} = $q->param($f) || 0;
		}
		
		my $submit = lc ( $q->param('submit') ) || lc ( $q->param('js_submit') );
		# die $submit;

		switch ( $submit ) {
			case 'get position' {
				$harp_params{calculate} = 'position';
				$harp_params{$_} = $q->param("calc_position-$_") || undef foreach (qw /key position_key/ );
			}
			case 'get harp key' {
				$harp_params{calculate} = 'key';
				$harp_params{$_} = $q->param("calc_key-$_") || undef foreach (qw /position position_key/ );
			}
			case 'get song key' {
				$harp_params{calculate} = 'position_key';
				$harp_params{$_} = $q->param("calc_position_key-$_") || undef foreach (qw /key position/ );
			}
			else {
				$harp_params{$_} = $q->param($_) foreach qw/key position/;
				$harp_params{calculate} = 'position_key';
			}
		}
	} # Submitted?

	my $harp = Harmonica::Layout::Table->new( %harp_params );
	my $b = [$harp->blowNotes];
	my $debug = '';
	$debug = Dumper ($q) if DEBUG;	
	my %template_params = (
		harp	=> $harp,
		debug	=> $debug,
	);
	
		
	$self->template->process('main', \%template_params);
					
	# do something here
}

sub submitted {
	my $self = shift;
	return 1 if $self->query->param('submit') || $self->query->param('js_submit');

	return 0;
}


1;
