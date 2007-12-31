package Harmonica::MusicLogic;
use strict;

use Harmonica::CircleOfFifths;
use Data::Dumper;

require Exporter;
our @ISA = qw(Exporter);
our @EXPORT = qw( interval_cmp );

my $BOUNDARY = 7;


sub interval_cmp {
	my $op = shift;
	my ($int1, $int2) = @_;

	my %co5_intervals = co5_intervals;
	my @intervals = keys %co5_intervals;

	foreach (@intervals) { 
		$_ = interval_to_num($_);
	}
	@intervals = sort @intervals;

	$int1 = interval_to_num($int1);
	$int2 = interval_to_num($int2);

	if ($op eq 'gt') {
		return interval_gt($int1, $int2, \@intervals);
	}
	
	return 1 if $int1 gt $int2;
	return 0;
}


sub interval_gt {
	my ($int1, $int2, $i) = @_;
	my @ints = @$i;

	return 0 if $int1 eq $int2;
	
	# Get location in intervals array for both intervals
	my ($int1_loc, $int2_loc);
	for (my $i = 0; $i < $#ints+1; $i++) {
		$int1_loc = $i if $int1 eq $ints[$i];
		$int2_loc = $i if $int2 eq $ints[$i];
	}

	print Dumper ($int1_loc, $int2_loc);
	my $diff = $int1_loc - $int2_loc;

	print Dumper ($diff);

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
	
	
