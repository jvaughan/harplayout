package Harmonica::Layout;
use strict;

use Data::Dumper;

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
		my @reeds = @{ $HOLES_INTERVALS->{richter}->{blow} };

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
	return '3';
}

sub noteFromInterval {
	my $self = shift;
	return 'Ab';
}			 
	

1;
