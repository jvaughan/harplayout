#!/bin/sh
export PERL5LIB=$PERL5LIB:.

carton exec starman --port 9000 app.psgi
