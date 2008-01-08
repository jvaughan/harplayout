package Harmonica::Layout::Table;

use Data::Dumper;

use base qw(Harmonica::Layout);

use Class::MethodMaker [
	new 	=> [ -hash => -init => 'new' ],	
	scalar	=> [
		{default => 0}	=> show_intervals,
		{default => 1}	=> show_notes,
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
				#print "n: " . Dumper($n);
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
	
	warn Dumper ($blow[0][0]);
	
	for my $bend (0 .. $#blow) {
		#print "bb: " . Dumper ($blow[$bend]);
		for my $reed (0 .. $#{ $blow[$bend] }) {
			my $note = $blow[$bend][$reed];
			my $fpi = defined $note ? $note->first_pos_interval : '';
			print "|	$fpi";
		}
		print "\n";
	}
}

1;
