package HarpLayout::Harmonica::Table;

use base qw(HarpLayout::Harmonica);

use Class::MethodMaker [
	new 	=> [ -hash => -init => 'new' ],	
	scalar	=> [
		{-default => 1}	=> 'include_bends',
		{-default => 1}	=> 'include_overbends',
		{-default => 0}	=> 'include_unnecessary_overbends',
		
		{default => 1}	=> show_intervals,
		{default => 1}	=> show_notes,
		{default => 1}	=> show_interval_categories,
	],			
];


sub init {
	my $self = shift;
	
	$self->SUPER::init;
	
	$self->{table} = {};
	$self->_makeTable;
}

sub _makeTable {
	my $self = shift;
	
	PLATE: foreach my $plate ( $self->plates )  {	
		my @table;
		my $hole = 0;
		
		REED: foreach ( $self->reeds($plate) ) {
			$hole++;
			my $bs = 0;
			while (my $n = $self->get_note( $plate, $hole, $bs) ) {
				$table[$bs][$hole -1] = $n;
				$bs++;
			}
		} # REED loop
		$self->{table}->{$plate} = \@table;	
	} # PLATE loop	
}


sub blowNotes {
	my $self = shift;
	
	return reverse ( @{ $self->{table}->{blow} } );
}


sub drawNotes {
	my $self = shift;
	
	return @{ $self->{table}->{draw} }
}


sub holeNums {
	my $self = shift;
	
	my $num_holes = $self->reeds('blow');
	return ( 1 .. $num_holes);
}


sub printTable {
	my $self = shift;
	
	my @blow = @{ $self->{table}->{blow} };
	
	for my $bend (0 .. $#blow) {
		for my $reed (0 .. $#{ $blow[$bend] }) {
			my $note = $blow[$bend][$reed];
			my $fpi = defined $note ? $note->first_pos_interval : '';
			print "|	$fpi";
		}
		print "\n";
	}
}

1;
