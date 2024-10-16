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

#CMD PERL_CARTON_PATH=$PERL_CARTON_PATH:. carton exec starman --port 80 app.psgi
CMD ./run.sh
