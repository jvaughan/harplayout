#!/usr/bin/perl -w 
use strict;

use Harmonica::Layout::Table;
use Data::Dumper;

my $harp = Harmonica::Layout::Table->new (position => '2', tuning => 'richter', key => 'F');
#warn Dumper ($harp);

print join (", ", $harp->holeNums);

print"\n";

