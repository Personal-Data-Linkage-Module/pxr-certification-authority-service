#!/bin/bash
# Copyright 2022 NEC Corporation
# Released under the MIT license.
# https://opensource.org/licenses/mit-license.php

set -eu;

cd /usr/src/app/ssl
export $(cat /usr/src/app/config/.env | sed 's/#.*//g' | xargs)

echo "" > /usr/src/app/ssl/chained-client.pem

# 
SELECT_CLIENT_CERT="SELECT certificate FROM pxr_certification_authority.certificate_manage WHERE cert_type='client' AND is_disabled=false;"

CLIENT_CERT=`PGPASSWORD=$DB_PASSWORD psql -t -U $DB_USER -h $DB_HOST -p $DB_PORT $DB_SCHEMA -c "${SELECT_CLIENT_CERT}"`
CLIENT_CERT=`echo "$CLIENT_CERT" | sed -e 's/+$//g' -e 's/^[ ]//g'`

echo "$CLIENT_CERT" > /usr/src/app/ssl/chained-client.pem
