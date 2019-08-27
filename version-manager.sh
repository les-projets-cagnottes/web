#!/bin/bash
set -e

# This script will be a single source of truth for changing versions in the whole app
# Right now its only changing the version in the template (e.g index.html), but we can manage
# versions in other files such as CHANGELOG etc.

PROJECT_DIR=$(pwd)
TEMPLATE_FILE="$PROJECT_DIR/src/app/valyou/valyou.component.html"
PACKAGE_FILE="$PROJECT_DIR/package.json"

echo ">> Change Version to"
read -p '>> Version: ' VERSION

echo
echo "  #### Changing version number to $VERSION ####"

#change in template file (ideally footer)
sed -i "s/<span class=\"version\"> .*<\/span>/<span class=\"version\">$VERSION<\/span>/" $TEMPLATE_FILE

#change in package.json
sed -i "s/\"version\"\:.*/\"version\"\: \"$VERSION\",/" $PACKAGE_FILE

echo "  #### New version number updated ####"
echo