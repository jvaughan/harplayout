#!/usr/bin/perl -w 
use strict;

use Harmonica::Layout;
use Data::Dumper;

my $harp = Harmonica::Layout->new (position => '1', tuning => 'richter', key => 'A');
print Dumper;

