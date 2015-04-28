#!/usr/bin/perl -w 
use strict;
use lib '.';

use CGI::Carp qw(fatalsToBrowser);
use HarpLayout::Webapp;

my $web = HarpLayout::Webapp->new;
$web->run;
