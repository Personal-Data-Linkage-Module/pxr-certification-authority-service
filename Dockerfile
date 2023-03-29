# Copyright 2022 NEC Corporation
# Released under the MIT license.
# https://opensource.org/licenses/mit-license.php
#
FROM node:12

WORKDIR /usr/src/app

# Install node modules
COPY package*.json ./
RUN npm install

# Build production
COPY . ./
RUN npm run build

# Node.js application port binding.
EXPOSE 3012

# Configure CA
# Make directory for ca
RUN mkdir ./ca
# Write an openssl.cfg file
ENV OPENSSL_CONF /usr/src/app/ca/openssl.cfg
RUN cat /etc/ssl/openssl.cnf > ./ca/openssl.cfg
RUN echo '\
[ CA_default ] \n\n\
dir             = /usr/src/app/ca \n\
certs           = $dir/certs \n\
crl_dir         = $dir/crl \n\
database        = $dir/index.txt \n\
new_certs_dir   = $dir/newcerts \n\
certificate     = $dir/ca_cert.pem \n\
serial          = $dir/serial \n\
crlnumber       = $dir/crlnumber \n\
crl             = $dir/crl.pem \n\
private_key     = $dir/private/ca_key.pem\n'\
>> ./ca/openssl.cfg

# Make any directories
RUN mkdir ./ca/certs
RUN mkdir ./ca/crl
RUN mkdir ./ca/newcerts
RUN mkdir ./ca/private
# Touch any files
RUN touch ./ca/index.txt
RUN touch ./ca/index.txt.attr
RUN touch ./ca/serial
RUN touch crlnumber
# Output lines to ca configure files
RUN echo "01" > ./ca/crlnumber
RUN echo "01" > ./ca/serial
RUN echo "unique_subject = yes" > ./ca/index.txt.attr
# Make keys
RUN openssl genrsa 2048 > ./ca/private/ca_key.pem
RUN openssl req -x509 -key ./ca/private/ca_key.pem -out ./ca/ca_cert.pem -days 36500 -subj "/C=JP/ST=<prefectures>/L=<municipalities>/O=<organization>/OU=PXR/CN=*"
RUN openssl ca -gencrl -out ./ca/crl/pxr_ca.crl

# Setup cron
RUN mkdir ssl
RUN apt update
RUN apt install -y cron postgresql-client
RUN update-rc.d cron defaults
RUN { echo ""; } | crontab -
RUN { crontab -l; echo "*/5 * * * * bash /usr/src/app/create-certificate-chain.bash"; } | crontab -

# Start a container with this line.
RUN chmod +x /usr/src/app/starting.sh
CMD [ "/usr/src/app/starting.sh" ]
