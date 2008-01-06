package Harmonica::Web;

use base qw/ CGI::Application /;
use CGI::Application::Plugin::AnyTemplate;
use CGI::Application::Plugin::AutoRunmode;

use Harmonica::Layout::Table;

sub cgiapp_init	{
	my $self = shift;

	# Set template options
	$self->template->config(
		default_type 	=> 'TemplateToolkit',
		include_paths	=> ['/Users/jvaughan/svn/jvaughan/trunk/dev/harplayout/templates',] ,
	);
}


sub showHarp : StartRunmode {
	my $self = shift;
	my $q = $self->query;
				
	my %harp_params;
	foreach my $p ($q->param) {
		$harp_params{$p} = $q->param($p) if $harp->can($p) && $q->param($p);
	}
		
	my %template_params = (
		harp	=> Harmonica::Layout::Table->new( %harp_params ),
	);
		
	$self->template->process('main', \%template_params);
					
	# do something here
}






1;
