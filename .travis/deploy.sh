#!/bin/bash

if ! [[ "$TRAVIS_BRANCH" == "develop-travis" ]]; then exit 0; fi

eval "$(ssh-agent -s)"
chmod 600 $TRAVIS_BUILD_DIR/.travis/id_rsa
ssh-add $TRAVIS_BUILD_DIR/.travis/id_rsa

ssh-keyscan -t rsa -H $IP >> ~/.ssh/known_hosts
scp -rp $TRAVIS_BUILD_DIR/dist/* apps@$IP:$DEPLOY_DIR/dist/

ssh -p $PORT apps@$IP -o StrictHostKeyChecking=no "$( cat <<EOT
    cd $DEPLOY_DIR
    echo "$(date -u) Travis Deploy"  >> ./console.log
    exit
EOT
)"

rm $TRAVIS_BUILD_DIR/.travis/id_rsa
