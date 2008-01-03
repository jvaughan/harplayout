package Harmonica::Layout::Table;

use base qw(Harmonica::Layout);

use Class::MethodMaker [
	new 	=> [ -hash => -init => 'new' ],
	scalar	=> [ qw/ position_key / ],
	scalar	=> [					
];


sub init {
	my $self = shift;
	
	$self->_makeTable;
}

sub _makeTable {
	my $self = shift;
	
	
}

1;
