#!/usr/bin/perl -w
use strict;

use Music::Scales;

sub get_note {
	#my $self = shift;
	my $note = shift;
	my $offset = shift;

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

print get_note("C", 11);
