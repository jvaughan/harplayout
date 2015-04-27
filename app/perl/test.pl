#!/usr/bin/perl -w 
use strict;

use Harmonica::Layout;
use Harmonica::Tuning;
use Data::Dumper;

my $harp = Harmonica::Layout->new (position => '2', tuning => 'richter', key => 'F', );
print "yes!\n" if $harp->can('sdkey');
warn Dumper (harp => $harp);
print join (", ", $harp->positions_available);



#print "ta: " . $harp->tunings_available;
my $t = Harmonica::Tuning->new;

print "ta: " . join (", ", $harp->tunings_available);
print "\n";