package Harmonica::MusicLogic;
use strict;

use Harmonica::CircleOfFifths;
use Data::Dumper;

require Exporter;
our @ISA = qw(Exporter);
our @EXPORT = qw( interval_cmp );


sub interval_cmp {
	my $op = shift;
	my ($int1, $int2) = @_;

	my %co5_intervals = co5_intervals;
	my @intervals = keys %co5_intervals;

	foreach (@intervals) { 
		$_ = interval_to_num($_);
	}

	$int1 = interval_to_num($int1);
	$int2 = interval_to_num($int2);

	if ($op eq 'gt') {
		return interval_gt($int1, $int2);
	}
	
	return 1 if $int1 gt $int2;
	return 0;
}


sub interval_gt {
	my ($int1, $int2) = @_;
	
	if ( ($int1 > $int2) && ($int1 - $int2 < 6)) {
		return 1;
	}

	return 0;
}
	

sub interval_to_num {
	$_ = shift;

	if (m/^b(\d)/) {
		my $n = $1 - 1;
		$_ = "${n}.5";
	}
	return $_;
}
	
	
