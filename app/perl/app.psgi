#!/usr/bin/perl -w 
use strict;
use Cwd;
use lib cwd;

use CGI::Carp qw(fatalsToBrowser);
use CGI::Application::PSGI;
use HarpLayout::Webapp;

 my $handler = sub {
      my $env = shift;
      my $app = HarpLayout::Webapp->new({ QUERY => CGI::PSGI->new($env) });
      CGI::Application::PSGI->run($app);
  };
