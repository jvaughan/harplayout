#!/usr/bin/perl -w 
use strict;

use Harmonica::Layout;
use Data::Dumper;

my $harp = Harmonica::Layout->new (position => '2', tuning => 'richter', key => 'C');
print Dumper;

