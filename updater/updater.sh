#!/bin/bash

# save old version number (must be an integer)
declare -i version=`cat version.txt`

# update from repo
pushd ..
git pull
popd

# get new version number
declare -i newversion=`cat version.txt`

# do the updater if we got a newer version
if ((newversion > version)); then
    # launch the update script with versions as arguments
    bash do-update.sh ${version} ${newversion}
fi
