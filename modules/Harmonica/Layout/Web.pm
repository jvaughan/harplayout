package Harmonica::Layout::Web;

use base qw/ Harmonica::Layout::Web /;

use Class::MethodMaker [
	new 	=> [ -hash => -init => 'new' ],				
];

sub init {
	$self->SUPER::init();
}




1;
