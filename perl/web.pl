#!/usr/bin/perl -w 
use strict;

use CGI::Carp qw(fatalsToBrowser);

use HarpLayout::Webapp;
use Data::Dumper;

my $web = HarpLayout::Webapp->new;

$web->run;

print"\n";