#!/bin/bash

echo ""
read -p "Username: " USER
read -s -p "Password: " PASSWORD
echo ""

RESP=`curl -s -d "{\"auth\": {\"passwordCredentials\": {\"username\":\"$USER\", \"password\":\"$PASSWORD\"}}}" -H"Content-type: application/json" http://cloud.lab.fi-ware.org:4730/v2.0/tokens`


TOKEN=`echo $RESP | sed "s/{\"access\":{\"token\":{.*\"id\":\"\(.*\)\"},\"user.*$/\1/g"`
echo -e "\nAccess Token: $TOKEN"
ORGS=`curl -s -H"x-auth-token: $TOKEN" http://cloud.lab.fi-ware.org:4730/v2.0/tenants`

echo -e "\nOrganizations: "  
set ORGS2=$ORGS
echo $ORGS | awk -v k="text" '{printf("%-32s %s \n", "ID", "Name"); n=split($0,a,"[{}]"); for (i=1; i<=n; i++) {m=split(a[i], b, "[,:\"]"); if (m>=15) printf("%-32s %s \n",  b[9], b[15])}}'

echo ""
read -p "Select an organization from the list above (ID): " ORG

BODY='{"auth": {"token":{"id": "'$TOKEN'"}, "tenantId": "'$ORG'"}}'

RESP1=`curl -s -X POST -H "Content-Type: application/json" -d "$BODY" http://cloud.lab.fi-ware.org:4730/v2.0/tokens`

TOKEN=`echo $RESP1 | sed "s/{\"access\":{\"token\":{.*\"id\":\"\(.*\)\",\"tenant.*$/\1/g"`

echo -e "\nToken: $TOKEN"
echo ""
