# Template Mikro-ORM

## Configurations

Before start you should have some configurations setups.

- Create and .env file as follow inside *root* folder.

```dosini
DB_URI=localhost
DB_PORT=3306
JWT_COOKIE_EXPIRES_IN=90
NODE_ENV=development
JWT_SECRET=perreointenso
JWT_EXPIRES_IN=90d
EMAIL_FROM=Crhistian
EMAIL_HOST=gmail
EMAIL_USERNAME=afogata.sas@gmail.com
EMAIL_PASSWORD=D35ARROLL0@f0g4t4.2021
```

## Installation

```sh
npm install 
```

Or

```sh
yarn install 
```

## Create DB on MySQL

```sh
npx mikro-orm schema:create -r
```

## Start project

```sh
yarn server
```
