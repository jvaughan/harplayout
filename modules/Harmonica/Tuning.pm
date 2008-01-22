package Harmonica::Tuning;
use strict;

my %tunings = (
        'Richter' => {
                blow => [qw / 1  3  5  1  3  5  1  3  5  1 /],
                draw => [qw / 2  5  7  2  4  6  7  2  4  6 /],
        },

	'Seydel Big Six' => {
		blow => [qw / 1  3  5  1  3  5 /],
                draw => [qw / 2  5  7  2  4  6 /],
	},

	'Paddy Richter' => {
		blow => [qw / 1  3 b6  1  3  5  1  3  5  1 /],
                draw => [qw / 2  5  7  2  4  6  7  2  4  6 /],
	},
	
	'L.O Melody Maker (labelled in 2nd pos)' => {
		blow => [qw / 1  3  6  1  3  5  1  3  5  1 /],
                draw => [qw / 2  5  7  2 b5  6  7  2 b5  6 /],
		label_position	=> 2,
	},
	
	'L.O Natural Minor (labelled in 2nd pos)' => {
		# Hole        1  2  3  4  5  6  7  8  9 10
		blow => [qw / 1 b3  5  1 b3  5  1  3  5  1 /],
                draw => [qw / 2  5 b7  2  4  6 b7  2  4  6 /],
		label_position	=> 2,
	},
	
	'L.O Harmonic Minor' => {
		# Hole        1  2  3  4  5  6  7  8  9 10
                blow => [qw / 1 b3  5  1 b3  5  1 b3  5  1 /],
                draw => [qw / 2  5  7  2  4 b6  7  2  4 b6 /],
        },
);

use Class::MethodMaker [
#	new_hash_with_init	=> 'new',
	new 			=> [ -hash => -init => 'new' ],
	scalar			=> [ 
		{-default => 1}, 'label_position',
		{-default => 'Richter'}, 'tuning' ],
	array			=> [ qw/ blow draw /],
];


sub init {
	my $self = shift;

	unless (grep { $self->tuning eq $_ } $self->available ) {
		die "No such tuning '" . $self->tuning . "': $!" ;
	}
	my $t = $tunings{ $self->tuning };
	$self->blow ( @{ $t->{blow} } );
	$self->draw ( @{ $t->{draw} } );
	$self->label_position ( $t->{ label_position } ) if $t->{ label_position };
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