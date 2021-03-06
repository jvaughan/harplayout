package HarpLayout::MusicLogic;
use strict;

use HarpLayout::MusicLogic::CircleOfFifths;
use Data::Dumper;

require Exporter;
our @ISA	= qw/ Exporter /;
our @EXPORT_OK	= qw/ interval_cmp subtract_interval add_interval note_from_key_interval note_from_position 
		  interval_from_position position_from_notes category_from_interval all_keys 
		  /;

my $BOUNDARY = 7;

my %scale_notes = (
C	=> [ 'C',	'Db',	'D',	'Eb',	'E',	'F',	'Gb',	'G',	'Ab',	'A',	'Bb',	'B',  ],
Db	=> [ 'Db',	'D',	'Eb',	'E',	'F',	'Gb',	'G',	'Ab',	'A',	'Bb',	'B',	'C',  ],
D	=> [ 'D',	'Eb',	'E',	'F',	'F#',	'G',	'Ab',	'A',	'Bb',	'B',	'C',	'C#', ],
Eb	=> [ 'Eb',	'E',	'F',	'Gb',	'G',	'Ab',	'A',	'Bb',	'B',	'C',	'Db',	'D',  ],
E	=> [ 'E',	'F',	'F#',	'G',	'Ab',	'A',	'Bb',	'B',	'C',	'C#',	'D',	'D#', ],
F	=> [ 'F',	'Gb',	'G',	'Ab',	'A',	'Bb',	'B',	'C',	'Db',	'D',	'Eb',	'E',  ],
'F#'	=> [ 'F#',	'G',   	'G#',	'A',	'A#',	'B',	'C',	'C#',	'D',	'D#',	'E',	'E#', ],
G	=> [ 'G',	'Ab',	'A',	'Bb',	'B',	'C',	'Db',	'D',	'Eb',	'E',	'F',	'F#', ],
Ab	=> [ 'Ab',	'A',	'Bb',	'B',	'C',	'Db',	'D',	'Eb',	'E',	'F',	'Gb',	'G',  ],
A	=> [ 'A',	'Bb',	'B',	'C',	'C#',	'D',	'Eb',	'E',	'F',	'F#',	'G',	'G#', ],
Bb	=> [ 'Bb',	'B',	'C',	'Db',	'D',	'Eb',	'E',	'F',	'Gb',	'G',	'Ab',	'A',  ],
B	=> [ 'B',	'C',	'C#',	'D',	'D#',	'E',	'F',	'F#',	'G',	'G#',	'A',	'A#', ],
);


sub all_keys {
	return ('G', 'Ab', 'A', 'Bb', 'B', 'C', 'Db', 'D', 'Eb', 'E', 'F', 'F#',);
}


sub interval_cmp {
	my $op = shift;
	my ($int1, $int2) = @_;
	
	$int1 = interval_to_num($int1);
	$int2 = interval_to_num($int2);

	my %co5_intervals = co5_intervals;
	my @intervals = keys %co5_intervals;
	foreach (@intervals) { 
		$_ = interval_to_num($_);
	}
	@intervals = sort @intervals;

	# Get location in array for both intervals
	my ($int1_loc, $int2_loc);
	for (my $i = 0; $i < $#intervals+1; $i++) {
		$int1_loc = $i if $int1 eq $intervals[$i];
		$int2_loc = $i if $int2 eq $intervals[$i];
	}
	my $diff = $int1_loc - $int2_loc;
	
	return 0 if $diff == 0; # Equal

	if ($op eq 'gt') {
		return interval_gt($diff);
	} 
	elsif ($op eq 'lt') {
		return interval_gt($diff) ? 0 : 1;
	}
}


sub interval_gt {
	my $diff = shift;
	
	if ( $diff < (0 - $BOUNDARY + 2)) {
		return 1;
	}
	elsif ( $diff > 0 && $diff < $BOUNDARY ) {
		return 1;
	}
	else {
		return 0;
	}
}
	

sub add_interval {
	return add_subtract_interval('add', @_);
}

	
sub subtract_interval {
	return add_subtract_interval('sub', @_);
}


sub add_subtract_interval {
	my $op = shift;
	my ($orig, $amt) = @_;

	$orig = interval_to_num($orig);
	
	while ($amt > 12) {
		$amt -= 12
	}

	my @intervals = sorted_numeric_intervals();
	my $orig_loc;
	my $i = 0;
	foreach (@intervals) {
		$orig_loc = $i if $_ == $orig;
		$i++;
	}

	my $new_loc;
	if ($op eq 'add') {
		$new_loc = $orig_loc + $amt;
	} 
	elsif ($op eq 'sub') {
		$new_loc = $orig_loc - $amt;
	}
	
	$new_loc -= 12 if $new_loc > 11;
	return num_to_interval( $intervals[$new_loc] );
}


sub note_from_key_interval {
	my $key = shift;
	my $interval = shift;
	
	my $note = $scale_notes{$key}->[ map_interval_to_chrom_idx($interval) ];
	return $note;
}			 

sub category_from_interval {
	my %int_to_cat = (
		1	=> 'chord',
		b2	=> 'danger',
		2	=> 'passing',
		b3	=> 'blue',
		3	=> 'chord',
		4	=> 'passing',
		b5	=> 'blue',
		5	=> 'chord',
		b6	=> 'danger',
		6	=> 'passing',
		b7	=> 'blue',
		7	=> 'danger',
	);
	
	return $int_to_cat{ $_[0] };
}

sub interval_to_num {
	$_ = shift;

	if (m/^b(\d)/) {
		my $n = $1 - 1;
		$_ = "${n}.5";
	}
	return $_;
}

sub num_to_interval {
	$_ = shift;

	if (m/\.5/) {
		$_ += 0.5;
		$_ = "b$_";
	}
	return $_;
}

sub map_interval_to_chrom_idx {
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
	
sub sorted_numeric_intervals {
	my %co5_intervals = co5_intervals;
	my @intervals = keys %co5_intervals;
	foreach (@intervals) { 
		$_ = interval_to_num($_);
	}
	@intervals = sort @intervals;
}


