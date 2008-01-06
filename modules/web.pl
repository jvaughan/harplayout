#!/usr/bin/perl -w 
use strict;

use CGI::Carp qw(fatalsToBrowser);

use Harmonica::Web;
use Data::Dumper;

my $web = Harmonica::Web->new;

$web->run;

print"\n";

