#!/usr/bin/perl -w 
use strict;

use Harmonica::Layout;
use Data::Dumper;

my $harp = Harmonica::Layout->new (position => '2', tuning => 'richter', key => 'F', );
print "yes!\n" if $harp->can('sdkey');
warn Dumper (harp => $harp);

