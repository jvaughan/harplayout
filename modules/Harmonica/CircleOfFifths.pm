package Harmonica::CircleOfFifths;
use strict;

use Music::Scales;

sub noteFromPosition {
	#my $self = shift;
	my $note = shift;
	my $position = shift;

	my $offset = $position - 1;

	if ($offset > 0) {
		while ($offset-- > 0) {
			my @maj = get_scale_notes ($note, 1);
			$note = $maj[4];
		}
		return $note;

	}
	elsif ($offset < 0) {
		while ($offset++ < 0) {
			my @maj = get_scale_notes ($note, 1);
			$note = $maj[3];
		}
		return $note;
	} 
	else {
		return $note;
	}
}

sub intervalFromPosition {
	my $interval = shift;;
	my $position = shift;

	my $offset = $position -1;

	my %clockwise = ( qw/
		1	4
		b2	b5
		2	5
		b3	b6
		3	6
		4	b7
		b5	7
		5	1
		b6	b2
		6	2
		b7	b3
		7	3
	/);

	my %anti_clockwise = reverse %clockwise;

	if ($offset > 0) {
                while ($offset-- > 0) {
			$interval = $clockwise{$interval};
                }
                return $interval;

        }
}

print "hello\n";
print intervalFromPosition(1, 3);
		
print "\n";


1;
