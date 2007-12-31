package Harmonica::Layout;
use strict;

use Data::Dumper;
use Music::Scales;
use Harmonica::CircleOfFifths;

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

	# Poupulate with data for natural notes
	PLATE: foreach my $plate (qw /blow draw/) {
		my @reeds = @{ $HOLES_INTERVALS->{ $self->tuning }->{ $plate } };

		REED: for (my $i = 0; $i < $#reeds + 1; $i++) {
			my $interval = $reeds[$i];
			my $attrs = {};
			$attrs->{type} = 'natural';
			$attrs->{tuning_offset} = '+0';

			$attrs->{position_interval} = intervalFromPosition ($interval, $self->position);
			$attrs->{note} = $self->noteFromInterval($self->position_key, $interval);
			
			$self->set_reed ($plate, $i + 1, 0, $attrs);
		}
	}

	print Dumper ($self);

}


sub set_reed {
	my $self = shift;
	my ($plate, $reed, $bendstep, $attrs) = @_;

	foreach (keys %$attrs) {
		$self->{ $plate }->[ $reed - 1 ]->[ $bendstep ]->{ $_ } = $attrs->{ $_ };
	}
}


sub addBentNotes {
	my $self = shift;

	my @draw = @{$self->{draw}};
	my @blow = @{$self->{blow}};
	
	for (my $i = 0; $i < $#draw+1 ; $i++) {
		my $reed = $draw[$i];
		my $natural = $reed->[0];
		my $opp_natural = $blow[$i]->[0];
		
#		my $closest = $natural
#		if  
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
