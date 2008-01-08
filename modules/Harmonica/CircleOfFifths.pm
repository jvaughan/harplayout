package Harmonica::CircleOfFifths;
use strict;

require Exporter;
our @ISA = qw(Exporter);
our @EXPORT = qw(note_from_position interval_from_position co5_intervals co5_notes);

use Music::Scales;

my %co5_notes = (
	C	=> 'G',
	G       => 'D',
	D       => 'A',
	A       => 'E',
	E       => 'B',
	B       => 'F#',
	"F#"    => 'Db',
	Db      => 'Ab',
	Ab      => 'Eb',
	Eb      => 'Bb',
	Bb      => 'F',
	F       => 'C',
);

my %co5_intervals = ( qw/
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


sub note_from_position {
	my $note     = shift;
	my $position = shift;

	my $offset = $position -1;
	
	# return $note unless ($offset);

	if ($offset > 0) {
                while ($offset-- > 0) {
			$note = $co5_notes{$note};
                }
                return $note;
        }
	elsif ($offset < 0) {
		while ($offset++ < 0) {
			$note = $co5_notes{$note};
		}
		return $note;
	} 
	else {
		return $note;
	}
}


sub interval_from_position {
	my $interval = shift;
	my $position = shift;

	my $offset = $position -1;

	if ($offset >= 0) {
                while ($offset-- > 0) {
			$interval = $co5_intervals{$interval};
                }
                return $interval;

        }
}


sub co5_intervals {
	return %co5_intervals;
}


sub co5_notes {
	return %co5_notes;
}

1;
