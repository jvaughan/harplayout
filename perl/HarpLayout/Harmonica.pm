package HarpLayout::Harmonica;
use strict;

use Data::Dumper;
use Switch;

use HarpLayout::Harmonica::Tuning;
use HarpLayout::MusicLogic qw/ 
	interval_from_position note_from_key_interval note_from_position category_from_interval 
	position_from_notes all_keys /;
use HarpLayout::Harmonica::Note;

use Class::MethodMaker [
	new 	=> [ -hash => -init => 'new' ],
	# scalar	=> [ qw/ positionkey / ],
	scalar	=> [	
		{-default => 'Richter'}		=> 'tuning',
		{-default => 'C'}		=> 'harp_key',
		{-default => 1}			=> 'position',
		{-default => undef}		=> 'song_key',
		{-default => 'song_key'}	=> 'calculate',
		
		{-default => undef}		=> 'tuning_obj',
	],
];


sub init {
	my $self = shift;

	$self->{blow} = [];
	$self->{draw} = [];
	
	$self->tuning_obj ( HarpLayout::Harmonica::Tuning->new(tuning => $self->tuning) );
	my $label_position = $self->tuning_obj->label_position;
	
	switch ( $self->calculate ) {
		case 'harp_key' {
			my $pos = ($self->position - $label_position) + 1;
			my $key = note_from_position ($self->song_key, '-' . $pos );
			$self->harp_key( $key );
		}
		
		case 'position' {
			my $pos = position_from_notes ( $self->harp_key, $self->song_key);
			$pos += $label_position -1;
			$pos -= 12 if $pos > 12;
			$self->position( $pos );
		} 
		
		case 'song_key' {
			my $p_k = note_from_position($self->harp_key, $self->position );
			$p_k = note_from_position ($p_k, "-" . $label_position);
			$self->song_key ( $p_k );
		}
	}
	
	$self->addNaturalNotes;	
	$self->addBends;
	$self->addOverbends;
}


sub addNaturalNotes {
	my $self = shift;

	my $tuning = $self->tuning_obj;
	
	# Poupulate each plate and reed with natural notes.
	PLATE: foreach my $plate ($self->plates) {
		my $reed = 0;
		REED: foreach my $interval ( $tuning->plate($plate) ) {
			$self->set_note ($plate, ++$reed, 0, $interval);
		}
        }
}


sub addBends {
	my $self = shift;

	PLATE: foreach my $plate ( $self->plates)  {
		my $opp_plate = $self->oppPlate($plate);	
		my $hole = 0;
		
		REED: foreach ( $self->reeds($plate) ) {
			$hole++;			
			my $natural = $self->get_note( $plate, $hole, 0 );
			my $opp_natural = $self->get_note( $opp_plate, $hole, 0 );
		
			my $closest = $natural;

			# Add bent notes, each one being one semitone closer to the opposing natural note,
			# stopping one semitone away.
			my $bendstep = 0;
			BEND: while ( --$closest > $opp_natural ) {
				$closest = $self->set_note( $plate, $hole, ++$bendstep, $closest->first_pos_interval );
			} 	
		} # REED loop
	} # PLATE loop
}


sub addOverbends {
	my $self = shift;
	
	PLATE: foreach my $plate ( $self->plates)  {
		my $opp_plate = $self->oppPlate($plate);	
		my $hole = 0;
		
		REED: foreach ( $self->reeds($plate) ) {
			my %attrs;
			$hole++;
			my $natural = $self->get_note( $plate, $hole, 0 );
			my $opp_natural = $self->get_note( $opp_plate, $hole, 0 );
	
			next REED unless ( $natural < $opp_natural ); # Skip if can't be overbent				
			
			# Overbent note is one semitone higher than the natural note of the opposing reed.
			my $overbend = $opp_natural + 1;
			
			if ( $self->holeHasNote( $hole +1, $overbend ) ) {
				# Considered unnecessary overbend if the note is available in the next hole up
				$attrs{unnecessary_ob} = 1;
			};
			$self->set_note ( $plate, $hole, 1, $overbend->first_pos_interval, \%attrs);
		} # REED
	} # PLATE
}


sub get_note {
	my $self = shift;
        my ($plate, $reed, $bendstep) = @_;

	return undef unless defined $self->{ $plate }->[ $reed -1 ];
	return $self->{ $plate }->[ $reed - 1 ]->[ $bendstep ];
}


sub set_note {
	# Takes: 
	# Plate (blow or draw)
	# Reed number 
	# Bend step - 0 for natural, 1 for first semitone bend, 2 for wholetone bend, etc
	# The first position interval
	my $self = shift;
	my ($plate, $reed, $bendstep, $firstposint, $attrs) = @_;

	my $note = HarpLayout::Harmonica::Note->new;
	$note->first_pos_interval($firstposint);
	$note->bendstep( $bendstep );

	$note->position_interval ( interval_from_position ($firstposint, $self->position) );
	$note->interval_category ( category_from_interval ($note->position_interval));
	$note->note ( note_from_key_interval($self->song_key, $note->position_interval) );
	$note->id("hole${reed}_${plate}_step${bendstep}");
	
	if ($bendstep == 0) { # Is unbent?
		$note->type('natural');
		$note->description("$reed hole $plate natural")
	}
	else { # It's a bend
		my $natural = $self->get_note($plate, $reed, 0);
		if ($note < $natural) { # standard bend
			$note->type("${plate}bend");
			$note->description("$reed hole $plate bend step $bendstep")
		} else { # overbend
			if ( $attrs->{unnecessary_ob} ) {
				$note->type("unnecessary_over${plate}")
			}
			else {
				$note->type("over${plate}");
			}
			
			$note->description("$reed hole over${plate}");			
		}
	}

	$self->{ $plate }->[ $reed - 1 ]->[ $bendstep ] = $note;
	return $note;
}


sub holeHasNote {
	my $self = shift;
	my $hole = shift;
	my $note = shift;
	
	PLATE: foreach my $plate ($self->plates) {
		my $bs = 0;
		NOTE: while ( $_ = $self->get_note($plate, $hole, $bs++) ) {
			return 1 if $note == $_;
		}
	}	
	return 0;
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

sub positions_available {
	return 1 .. 12;
}

sub keys_available {
	return all_keys();
}

sub tunings_available {
	my $self = shift;
	return HarpLayout::Harmonica::Tuning->available;
}

1;
