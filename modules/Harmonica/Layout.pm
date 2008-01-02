package Harmonica::Layout;
use strict;

use Data::Dumper;
use Music::Scales;
use Harmonica::CircleOfFifths;
use Harmonica::Note;
use Harmonica::Tuning;

use Class::MethodMaker [
	new 			=> [ -hash => -init => 'new' ],
	scalar			=> [ qw/ position_key / ],
	scalar			=> [	
					{-default => 'richter'}		=> 'tuning',
					{-default => '1'}		=> 'position',
					{-default => 'C'}		=> 'key',	
					{-default => 1}			=> 'include_bends',
					{-default => 1}			=> 'include_overbends',
					{-default => 0}			=> 'include_unnecessary_overbends',
				   ],					
];


sub init {
	my $self = shift;

	$self->{blow} = [];
	$self->{draw} = [];

	$self->position_key( noteFromPosition($self->key, $self->position) );
	
	$self->addNaturalNotes;
	$self->addBends if $self->include_bends;
	$self->addOverbends if $self->include_overbends;	
}


sub addNaturalNotes {
	my $self = shift;

	my $t = Harmonica::Tuning->new( tuning => $self->tuning );
	
	# Poupulate with data for natural notes

	PLATE: foreach my $plate (qw /blow draw/) {
		my $reed = 0;
		REED: foreach my $interval ( $t->plate($plate) ) {
			$self->set_reed ($plate, ++$reed, 0, $interval);
		}
        }
}


sub set_reed {
	# Takes: 
	# Plate (blow or draw)
	# Reed number 
	# Bend step - 0 for natural, 1 for first semitone bend, 2 for wholetone bend, etc
	# The first position interval
	my $self = shift;
	my ($plate, $reed, $bendstep, $firstposint) = @_;


	my $note = Harmonica::Note->new;
	$note->first_pos_interval($firstposint);

	$note->position_interval ( intervalFromPosition ($firstposint, $self->position) );
	$note->note ( $self->noteFromInterval($self->position_key, $note->position_interval) );
	$note->bendstep($bendstep);

	if ($bendstep == 0) { # Is unbent?
		$note->type('natural');
		$note->description("$reed hole $plate natural")
	}
	else { # It's a bend
		my $natural = $self->get_note($plate, $reed, 0);
		if ($note < $natural) { # standard bend
			$note->type('bend');
			$note->description("$reed hole $plate bend step $bendstep")
		} else { # overbend
			$note->type("over${plate}");
			$note->description("$reed hole over${plate}");			
		}
	}

	$self->{ $plate }->[ $reed - 1 ]->[ $bendstep ] = $note;
	return $note;
}


sub plates {
	my $self = shift;
	
	return qw/blow draw/;
}

sub oppPlate {
	my $self = shift;
	my $plate = shift;
	
	return $plate eq 'blow' ? 'draw' : 'blow';
}

sub reeds {
	my $self = shift;
	
	return @{ $self->{$_[0]} };
}

sub reed {
	my $self = shift;
	my $hole = shift;
	
	return $self->reeds->[$hole +1];
}

sub get_note {
	my $self = shift;
        my ($plate, $reed, $bendstep) = @_;
	return $self->{ $plate }->[ $reed - 1 ]->[ $bendstep ];
}

sub addBends {
	my $self = shift;

	PLATE: foreach my $plate ( $self->plates)  {
		my $opp_plate = $self->oppPlate($plate);	
		my $hole = 0;
		
		# REED: for (my $i = $#plate; $i >=0; $i--) {
		REED: foreach ( $self->reeds($plate) ) {
			$hole++;			
			my $natural = $self->get_note( $plate, $hole, 0 );
			my $opp_natural = $self->get_note( $opp_plate, $hole, 0 );
		
			my $closest = $natural;
			my $bendstep = 0;
			BEND: while ( --$closest > $opp_natural ) {
				$closest = $self->set_reed( $plate, $hole, ++$bendstep, $closest->first_pos_interval );
			} 	
		} # REED
	} # PLATE
}

sub addOverbends {
	my $self = shift;
	
	$self->include_unnecessary_overbends(0);
	
	PLATE: foreach my $plate ( $self->plates)  {
		my $opp_plate = $self->oppPlate($plate);	
		my $hole = 0;
		
		# REED: for (my $i = $#plate; $i >=0; $i--) {
		REED: foreach ( $self->reeds($plate) ) {
			$hole++;
			my $natural = $self->get_note( $plate, $hole, 0 );
			my $opp_natural = $self->get_note( $opp_plate, $hole, 0 );
	
			next REED unless ( $natural < $opp_natural ); # Can be overblown / drawn				
			my $overbend = $opp_natural + 1;
			unless ( $self->include_unnecessary_overbends ) {
				next if $self->holeHasNote( $hole +1, $overbend );
			}
			$self->set_reed ( $plate, $hole, 1, $overbend->first_pos_interval );
		} # REED
	} # PLATE
}


sub holeHasNote {
	my $self = shift;
	my $hole = shift;
	my $note = shift;
	
	PLATE: foreach my $plate (qw /draw blow/) {
		my $bs = 0;
		my $nn;
		while ( 1 ) {
			$nn = $self->get_note($plate, $hole, $bs);
			last unless defined $nn;
			return 1 if $note == $nn;
			$bs++;
		}
	}	
	return 0;
}


sub noteFromInterval {
	my $self = shift;
	my $key = shift;
	my $interval = shift;

	my @chrom = get_scale_notes ($key, 12);
	my $note = $chrom[ $self->mapIntervalToChromIdx($interval) ];
	return $note;
}			 


sub mapIntervalToChromIdx {
	my $self = shift;
	my $interval = shift;

	my %int_to_chrom = (
		1	=> 0,
		b2	=> 1,
		2	=> 2,
		b3	=> 3,
		3	=> 4,
		4	=> 5,
		b5	=> 6,
		5	=> 7,
		b6	=> 8,
		6	=> 9,
		b7	=> 10,
		7	=> 11,
	);

	return $int_to_chrom{$interval};
}
	

sub intervalFromScale {
	my $self = shift;
	my $key = $self->position_key;
	my $note;
}

		

1;
