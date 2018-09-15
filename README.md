# lattis-hapi
Lattis Demo API With HapiJS

## Stack

1. HapiJS server (https://hapijs.com/)
2. BookshelfJS database ORM (http://bookshelfjs.org/)
3. HapiJS (lab/code) for testing (https://github.com/hapijs/lab,https://github.com/hapijs/code)
4. Swagger API documentation (https://github.com/glennjones/hapi-swagger)

## Setup

1. git clone  https://github.com/mitzsuyi/lattis-hapi.git
2. cd lattis-hapi
3. yarn install (postinstall step creates migrates database)

## Configure
 
### depends on several environment variables set either via .env file or other means

sample .env file

PORT:3000
JWT_SECRET=your secret key (strong password ok -- long random bytes
JWT_TOKEN_EXPIRY="1h" (expressed in seconds or a string describing a time span -- eg 60, "2 days", "10h", "7d".
A numeric value is interpreted as a seconds count. 
If you use a string be sure you provide the time units (days, hours, etc),
otherwise milliseconds unit is used by default ("120" is equal to "120ms").
MYSQL_DB_URL=mysql://username:password@hostname:port/db

these are loaded in config/index.js file

### database configuration

see knexfile.js -- various settings for different enviroonments

##  Run Tests

yarn test

## Up and Running

yarn start

## API DOOCUMENTATION VIA SWAGGER

http://[ROOT_URL]/domentation

## LICENSE

MIT
