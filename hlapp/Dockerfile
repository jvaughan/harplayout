FROM perl

RUN apt-get update
RUN apt-get install -y cpanminus make gcc starman

RUN cpanm Carton

COPY app /app
RUN adduser --disabled-password --gecos '' starman
RUN chown -R starman:starman /app

USER starman
WORKDIR /app/perl
RUN carton install

RUN export PERL5LIB="$PERL5LIB:."

RUN echo $PERL5LIB

CMD carton exec starman --port 9000 --workers 2 --preload-app app.psgi
