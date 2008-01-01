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
				   ],					
];


sub init {
	my $self = shift;

	$self->{blow} = [];
	$self->{draw} = [];

	$self->position_key( noteFromPosition($self->key, $self->position) );
	$self->addNaturalNotes;
	$self->addBentNotes;
	print Dumper ($self);
}

sub addNaturalNotes {
	my $self = shift;

	my $t = Harmonica::Tuning->new( tuning => $self->tuning );
	
	# Poupulate with data for natural notes

	PLATE: foreach my $plate (qw /blow draw/) {
                my @reeds = $t->plate($plate);

                REED: for (my $i = 0; $i < $#reeds + 1; $i++) {
                        my $interval = $reeds[$i];
                        $self->set_reed ($plate, $i + 1, 0, $interval);
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
	$note->note ( $self->noteFromInterval($self->key, $firstposint) );
	$note->bendstep($bendstep);

	if ($bendstep == 0) {
		$note->type('natural');
		$note->description("$reed hole $plate natural")
	}
	else {
		my $opp_plate = $plate eq 'blow' ? 'draw' : 'blow';
		my $opp_natural = $self->get_note($opp_plate, $reed, 0);
		my $natural = $self->get_note($plate, $reed, 0);
		if ($note < $natural) { # standard bend
			$note->type('bend');
			$note->description("$reed hole $plate bend step $bendstep")
		} else { # overbend
			$note->type("over${plate}");
			$note->description("$reed hole $plate over${plate}");
			
		}
	}

	$self->{ $plate }->[ $reed - 1 ]->[ $bendstep ] = $note;
	return $note;
}


sub get_note {
	my $self = shift;
        my ($plate, $reed, $bendstep) = @_;

	return $self->{ $plate }->[ $reed - 1 ]->[ $bendstep ];
}

sub addBentNotes {
	my $self = shift;

	PLATE: foreach my $plate (qw /blow draw/) {
		my @plate = @{ $self->{$plate} };
		my $opp_plate = $plate eq 'blow' ? 'draw' : 'blow';
		my @opp_plate = @{ $self->{$opp_plate} };
		
		REED: for (my $i = 0; $i < $#plate+1 ; $i++) {
			my $hole = $i + 1;
			my $natural = $self->get_note($plate, $hole, 0);
			my $opp_natural = $self->get_note($opp_plate, $hole, 0);
		
			# Natural bends.
			my $closest = $natural;
			my $bendstep = 0;
			BEND: while ( --$closest > $opp_natural ) {
				$closest = $self->set_reed ($plate, $hole, ++$bendstep, $closest->first_pos_interval);
			} 

			if ($natural < $opp_natural) {
				# Can be overblown / drawn
				my $overbend = $opp_natural + 1;
				$self->set_reed ($plate, $hole, 1, $overbend->first_pos_interval);
			}
		}
	}
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
