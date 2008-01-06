package Harmonica::Layout::Web;

use base qw/ Harmonica::Layout::Table /;

use CGI;
use Template;

use Class::MethodMaker [
	new 	=> [ -hash => -init => 'new' ],
	scalar	=> ['template',],			
];

sub init {
	$self->SUPER::init();
	
	my $t = Template->new
		(INCLUDE_PATH	=> '/Users/jvaughan/svn/jvaughan/trunk/dev/harplayout/templates',
		 INTERPOLATE	=> 1,
		);
		
	$self->template($t);
}


sub run {
	my $self = shift;
	
	my $t = $self->template;	
	my $vars = {
		harp => $self,
	}
	$t->process ('main', $vars);
}




1;
