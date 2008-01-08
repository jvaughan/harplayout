package Harmonica::Tuning;
use strict;

my %tunings = (
        'Richter' => {
                blow => [qw / 1  3  5  1  3  5  1  3  5  1 /],
                draw => [qw / 2  5  7  2  4  6  7  2  4  6 /],
        },

	'Paddy Richter' => {
		blow => [qw / 1  3 b6  1  3  5  1  3  5  1 /],
                draw => [qw / 2  5  7  2  4  6  7  2  4  6 /],
	},
);

use Class::MethodMaker [
#	new_hash_with_init	=> 'new',
	new 			=> [ -hash => -init => 'new' ],
	scalar			=> [ {-default => 'Richter'}, 'tuning' ],
	array			=> [ qw/ blow draw /],
]	;


sub init {
	my $self = shift;

	unless (grep { $self->tuning eq $_ } $self->available ) {
		die "No such tuning '" . $self->tuning . "': $!" ;
	}
	
	$self->blow ( @{ $tunings{ $self->tuning }->{blow} } );
	$self->draw ( @{ $tunings{ $self->tuning }->{draw} } );
}

sub available {
	return sort keys %tunings;
}

sub plate {
	my $self = shift;
	$_ = shift;
	
	return $self->blow if $_ eq 'blow';
	return $self->draw if $_ eq 'draw';
	
	die "no such plate $_: $!";
}


1;