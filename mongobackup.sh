#!/bin/bash

#source: https://gist.github.com/sheharyarn/0f04c1ba18462cddaaf5

# Make it executable:
#
# chmod +x mongo_backup.sh
# Schedule a Cronjob:
#
# sudo su
# crontab -e
# Enter this in a new line:
#
# # Everyday at 1 a.m.
# 00 01 * * * /bin/bash /home/username/scripts/mongo_backup.sh

MONGO_DATABASE="biju"
APP_NAME="biju-app"

MONGO_HOST="127.0.0.1"
MONGO_PORT="27017"
TIMESTAMP=`date +%F-%H%M`
MONGODUMP_PATH="/usr/bin/mongodump"
BACKUPS_DIR="$HOME/backups/$APP_NAME"
BACKUP_NAME="$APP_NAME-$TIMESTAMP"

# mongo admin --eval "printjson(db.fsyncLock())"
# $MONGODUMP_PATH -h $MONGO_HOST:$MONGO_PORT -d $MONGO_DATABASE
$MONGODUMP_PATH -d $MONGO_DATABASE
# mongo admin --eval "printjson(db.fsyncUnlock())"

mkdir -p $BACKUPS_DIR
mv dump $BACKUP_NAME
tar -zcvf $BACKUPS_DIR/$BACKUP_NAME.tgz $BACKUP_NAME
rm -rf $BACKUP_NAME
