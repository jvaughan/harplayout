package Harmonica::CircleOfFifths;

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

print get_note("C", 12);
print "\n";


1;
