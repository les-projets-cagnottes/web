#!/bin/bash

TAG_NAME=$1
DEPLOY_LOCATION="$( cd "$(dirname "$0")" ; pwd -P )"
FINAL_LOCATION=/opt/les-projets-cagnottes/web

echo "$(date -u) Automatic Deploy"  >> ${DEPLOY_LOCATION}/console.log

mda=/usr/mda
if [ ! -L /var/www/html/les-projets-cagnottes ]; then
  ln -s ${FINAL_LOCATION}/dist /var/www/html/les-projets-cagnottes
fi

rm -rf ${FINAL_LOCATION}/dist
cp ${DEPLOY_LOCATION}/dist ${FINAL_LOCATION}/dist
cp -R ${DEPLOY_LOCATION} ${FINAL_LOCATION}/${TAG_NAME}

exit 0
