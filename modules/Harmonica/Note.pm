package Harmonica::Note;
use strict;

use Data::Dumper;
use Music::Scales;
use Harmonica::CircleOfFifths;
use Harmonica::MusicLogic;

use overload
	'+'	=> \&add,
	'-'	=> \&subtract,
	'>'	=> \&gt,
	'<'	=> \&lt,
;

use Class::MethodMaker
        new_hash_with_init      => 'new',
        get_set                 => [ qw/first_pos_interval position_interval note bendstep description type/ ]
;

sub init {} 

sub gt {
	print Dumper (@_);
	return interval_cmp('gt', $_[0]->first_pos_interval, $_[1]->first_pos_interval);
}

sub lt {
	print Dumper (@_);
	return interval_cmp('lt', $_[0]->first_pos_interval, $_[1]->first_pos_interval);
}



sub subtract {
	return subtract_interval( $_[0]->first_pos_interval, $_[1]);
}


sub add {
	return add_interval( $_[0]->first_pos_interval, $_[1]);
}

1;
