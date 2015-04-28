FROM perl

#COPY conf/default.conf /etc/nginx/conf.d/

RUN apt-get update
RUN apt-get install -y libswitch-perl libtemplate-perl cpanminus make gcc starman libclass-methodmaker-perl

RUN cpanm Carton

COPY app app

WORKDIR app/perl
RUN carton install
# --deployment
#CMD PERL_CARTON_PATH=$PERL_CARTON_PATH:. carton exec starman --port 80 app.psgi
#CMD PERL_CARTON_PATH=$PERL_CARTON_PATH:. carton exec starman --port 80 app.psgi
CMD ./run.sh
