Package Harmonica::Layout;
use strict;

use Class::MethodMaker
	new_hash_with_init	=> 'new';
	get_set			=> qw/tuning position key/
;


sub init {
	my $self = shift;

	$self->{blow} = {};
	$self->{draw} = {};

	# Poupulate with data for natural notes
	PLATE: foreach my $plate (qw /blow draw/) {
		my @reeds = @$holes_intervals->{$self->tuning}->{$plate};

		REED: for (my $i = 0; $i < $#reeds $i++) {
			$self->set_hole ($plate, $i + 1, 0, 
				{note => $self>noteFromInterval ($reeds[$i]),
				 position_interval => $self->positionInterval ($reeds[$i]),
				 type => 'natural',
				 tuning_offset => '+0',
				}
			);
		}
	}

}


sub set_hole {
	my $self = shift;

	my ($plate, $hole, $bendstep, $attrs) = @_;

	foreach (keys %$attrs) {
		$self->{ $plate }->[ $hole - 1 ]->[ $bendstep ]->{ $_ } = $attrs->{ $_ };
	}
}



sub noteFromInterval {
	my $self = shift;

}			 
			
				
		

