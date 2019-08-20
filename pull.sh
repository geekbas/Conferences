#!/bin/sh

echo 'drop database confs;' | psql postgres

PGUSER=conf heroku pg:pull DATABASE_URL confs

echo '\\l' | psql postgres

exit 0

