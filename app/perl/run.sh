#!/bin/sh
#export PERL_CARTON_PATH=$PERL_CARTON_PATH:.

export PERL5LIB=$PERL5LIB:.

carton exec starman --port 9000 app.psgi
