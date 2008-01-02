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
					{-default => 1}			=> 'include_overblows',
					{-default => 0}			=> 'include_unnecessary_overblows',
				   ],					
];


sub init {
	my $self = shift;

	$self->{blow} = [];
	$self->{draw} = [];

	$self->position_key( noteFromPosition($self->key, $self->position) );
	$self->addNaturalNotes;
	$self->addBentNotes;
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
	else {
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
		
		# Do this in reverse, so pointless overbends can be avoided
		
		REED: for (my $i = $#plate; $i >=0; $i--) {
			my $hole = $i + 1;
			my $natural = $self->get_note($plate, $hole, 0);
			my $opp_natural = $self->get_note($opp_plate, $hole, 0);
		
			# Natural bends.
			if ($self->include_bends) {
				my $closest = $natural;
				my $bendstep = 0;
				BEND: while ( --$closest > $opp_natural ) {
					$closest = $self->set_reed ($plate, $hole, ++$bendstep, $closest->first_pos_interval);
				} 
			}
			
			$self->include_overblows(1);
			$self->include_unnecessary_overblows(0);
			if ($self->include_overblows) {
				if ($natural < $opp_natural) {
					# Can be overblown / drawn
					my $overbend = $opp_natural + 1;
					unless ($self->include_unnecessary_overblows) {
						next if $self->holeHasNote($hole +1, $overbend);
					}
					$self->set_reed ($plate, $hole, 1, $overbend->first_pos_interval);
				}
			} # include_overblows?
		} # REED
	} # PLATE
}


sub holeHasNote {
	my $self = shift;
	my $hole = shift;
	my $note = shift;
	
	PLATE: foreach my $plate (qw /blow draw/) {
		NOTE: foreach ( @{ $self->{$plate}->[$hole -1] }  ) {
			return 0 unless defined $_;
			return 0 unless ref($_) eq 'Harmonica::Note'; 
			return 1 if $note == $_;
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
