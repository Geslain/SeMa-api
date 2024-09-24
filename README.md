# SeMa Api

![SeMa Logo](https://github.com/Geslain/SeMa/blob/main/logo.png?raw=true "SeMa Logo")

## Description

SeMa project management Api of [SeMa](https://github.com/Geslain/SeMa) project. It has been created from [NestJS](http://nestjs.com/) project

## Installation

Please refer to [SeMa](https://github.com/Geslain/SeMa-api) Readme file for install. This app is meant to be used with [docker](https://www.docker.com/).
But still, for development purpose you can install with the following command:

```bash
$ cp .env.template .env # Copy env variables
$ yarn install
```

## Running the app

**Don't forget that a mongo instance must run if you want to use the app without docker.**

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Test

```bash
# unit tests
$ docker exec SeMa-api yarn test 
# or 
$ yarn run test

# e2e tests
$ docker exec SeMa-api yarn test:e2e
# or
$ yarn run test:e2e

# test coverage
$ docker exec SeMa-api yarn test:cov
# or
$ yarn run test:cov
```

## Documentation

[Swagger](https://swagger.io/) documentation can be found on `/api` url

* if you launch the app locally: http://127.0.0.1:3000/api
* if you launch the app with docker: http://127.0.0.1:3001/api

## Development

The ensure a clean and normalized development process, commit hooks have been settled on this project. You can find it in the `.husky` directory

Following tools are used:
* [husky](https://typicode.github.io/husky/)
* [commitlint](https://commitlint.js.org/)
* [commitizen](https://commitizen-tools.github.io/commitizen/)

In addition, every time you commit, code is formatted, linted, and unit and e2e tests are launched.
**This also means that docker must be running in order to be able to commit.**

## License

Nest is [MIT licensed](LICENSE).
