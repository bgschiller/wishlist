set -e

dropdb wishlist_test
createdb wishlist_test

knex migrate:latest
knex seed:run --env test

jest