package Harmonica::Layout;
use strict;

use Data::Dumper;
use Music::Scales;

use Class::MethodMaker
	new_hash_with_init	=> 'new',
	get_set			=> [ qw/tuning position key/ ]
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

	# Poupulate with data for natural notes
	PLATE: foreach my $plate (qw /blow draw/) {
		my @reeds = @{ $HOLES_INTERVALS->{ $self->tuning }->{ $plate } };

		REED: for (my $i = 0; $i < $#reeds + 1; $i++) {
			$self->set_hole ($plate, $i + 1, 0, 
				{
				position_interval => $self->positionInterval ($reeds[$i]),
				type => 'natural',
				tuning_offset => '+0',
				note => $self->noteFromInterval($reeds[$i]),
				}
			);
		}
	}

	print Dumper ($self);

}


sub set_hole {
	my $self = shift;

	my ($plate, $hole, $bendstep, $attrs) = @_;

	print Dumper ($attrs->{fuck});

	foreach (keys %$attrs) {
		$self->{ $plate }->[ $hole - 1 ]->[ $bendstep ]->{ $_ } = $attrs->{ $_ };
	}
}


sub positionInterval {
	my $self = shift;
	my $interval = shift;

	if ($self->position == 1) {
		return $interval;
	}
	return 'dunno';
}


sub noteFromInterval {
	my $self = shift;
	my $interval = shift;

	my @chrom = get_scale_notes ($self->key, 12);
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
	
	

1;
