package Harmonica::MusicLogic;
use strict;

use Harmonica::CircleOfFifths;
use Data::Dumper;

require Exporter;
our @ISA = qw(Exporter);
our @EXPORT = qw( interval_cmp subtract_interval add_interval);

my $BOUNDARY = 7;


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
	
	if ($op eq 'eq') {
		return 1 if $diff == 0;
	}

	return 0 if $diff == 0;

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



sub subtract_interval {
	return add_subtract_interval('sub', $_[0], $_[1]);
}


sub add_interval {
	return add_subtract_interval('add', $_[0], $_[1]);
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
	
sub sorted_numeric_intervals {
	my %co5_intervals = co5_intervals;
	my @intervals = keys %co5_intervals;
	foreach (@intervals) { 
		$_ = interval_to_num($_);
	}
	@intervals = sort @intervals;
}


