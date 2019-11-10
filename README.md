# sandbox_hasura_webhook

Temporary hasura passport bearer strategy webhook for sandbox arch.

## how

```sh
git clone url sandbox_hasura_webhook
cd sandbox_hasura_webhook
npm i
PORT=3000 npm start
```

## env

In process environment must be defined:

```sh
GQL_SECRET='<x-hasura-admin-secret>'
GQL_PATH='<gqlurl>'
PORT=3000
```
