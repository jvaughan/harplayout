package Harmonica::Note;
use strict;

use Harmonica::MusicLogic qw/ add_interval subtract_interval interval_cmp /;

use overload
	'+'	=> \&add,
	'-'	=> \&subtract,
	'=='	=> \&eq,
	'>'	=> \&gt,
	'>='	=> \&gte,
	'<'	=> \&lt,
	'<='	=> \&lte,
	'fallback' => 1,

;

use Class::MethodMaker [
        new	=> [ -hash => -init => 'new' ],
        scalar	=> [ qw/first_pos_interval position_interval interval_category note bendstep description type/ ]
];

sub init {} 

sub add {
	return __PACKAGE__->new (
		first_pos_interval => add_interval( $_[0]->first_pos_interval, $_[1]),
		);
}

sub subtract {
	return __PACKAGE__->new (
		first_pos_interval => subtract_interval( $_[0]->first_pos_interval, $_[1]),
		);
}

sub eq {
	$_[0]->first_pos_interval eq $_[1]->first_pos_interval ? 1 : 0;
}

sub gt {
	return interval_cmp('gt', $_[0]->first_pos_interval, $_[1]->first_pos_interval);
}

sub gte {
	return 1 if $_[0] == $_[1];
	return $_[0] > $_[1];
}

sub lt {
	return interval_cmp('lt', $_[0]->first_pos_interval, $_[1]->first_pos_interval);
}

sub lte {
	return 1 if $_[0] == $_[1];
	return $_[0] < $_[1]; 
}



1;
