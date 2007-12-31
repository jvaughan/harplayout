package Harmonica::Note;
use strict;

use Data::Dumper;
use Music::Scales;
use Harmonica::CircleOfFifths;

use Class::MethodMaker
        new_hash_with_init      => 'new',
        get_set                 => [ qw/first_pos_interval position_interval note bendstep description type/ ]
;

sub init {} 

1;
