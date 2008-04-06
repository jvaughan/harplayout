#!/usr/bin/perl -w 
use strict;

use CGI::Carp qw(fatalsToBrowser);

use HarpLayout::Webapp::FormAndHarp;
use Data::Dumper;

my $web = HarpLayout::Webapp::FormAndHarp->new;

$web->run;

print"\n";