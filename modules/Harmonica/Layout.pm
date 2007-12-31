package Harmonica::Layout;
use strict;

use Data::Dumper;
use Music::Scales;
use Harmonica::CircleOfFifths;
use Harmonica::Note;

use Class::MethodMaker
	new_hash_with_init	=> 'new',
	get_set			=> [ qw/tuning position key position_key/ ]
;


my $HOLES_INTERVALS = {
        richter => {
                blow => [qw /1 3 5 1 3 5 1 3 5 1/],
                draw => [qw /2 5 7 2 4 6 7 2 4 6/],
        }
};


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

	# Poupulate with data for natural notes
	PLATE: foreach my $plate (qw /blow draw/) {
                my @reeds = @{ $HOLES_INTERVALS->{ $self->tuning }->{ $plate } };

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


	my %attrs;
	$attrs{first_pos_interval} = $firstposint;
	$attrs{position_interval} = intervalFromPosition ($firstposint, $self->position);	
	$attrs{note} = $self->noteFromInterval($self->key, $firstposint);
	$attrs{bendstep} = $bendstep;

	if ($bendstep == 0) {
		$attrs{type} = 'natural';
	}
	else {
		$attrs{type} = 'bend';
	}

	$attrs{description} = "$reed hole $plate $attrs{type}";
	my $note = Harmonica::Note->new( %attrs );

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

	my @draw = @{$self->{draw}};
	my @blow = @{$self->{blow}};
	
	REED: for (my $i = 0; $i < $#draw+1 ; $i++) {
		my $reed = $draw[$i];
		my $hole = $i + 1;
		my $natural = $self->get_note('draw', $hole, 0);
		my $opp_natural = $self->get_note('blow', $hole, 0);
		
		my $closest = $natural;
		my $bendstep = 0;
		BEND: while ( 1 ) {
			my $newint = $closest - 1;
			last unless $closest > $opp_natural;
			$bendstep++;
			print "newint: $newint, bendstep: $bendstep, hole: $hole\n";
			$closest = $self->set_reed ('draw', $hole, $bendstep, $newint);
		} 
	}
}


sub positionInterval {
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
