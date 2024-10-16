FROM nginx
copy default.conf /etc/nginx/conf.d/default.conf

RUN rm /usr/share/nginx/html/index.html
COPY css /usr/share/nginx/html/css
COPY js /usr/share/nginx/html/js
