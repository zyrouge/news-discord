# News Bot

❤️ Heart of **News Bot**

## Conditions

-   Feel free to contribute this project
-   Commercial Usage is highly discouraged

## Changelogs

[Click here](changelogs.md)

## Requirements

-   [Git](https://git-scm.com/downloads)
-   [NodeJS](https://nodejs.org/en/download/)
-   [A Discord Application](https://discord.com/developers/applications)
-   Some IDE

## Setup

-   Cloning

```console
$ git clone https://github.com/zyrouge/news-discord.git
```

-   Installing Packages

**NPM**

```console
$ npm install
```

**Yarn**

```console
$ yarn add
```

-   Fill required credentials in [`.env.example`](.env.example) and rename it to `.env.production`

-   Change necessary things in [`settings.yaml`](settings.yaml)

-   Running Bot

**NPM**

```console
$ npm start
```

**Yarn**

```console
$ yarn start
```

## Development

-   Fork this Repo

-   Cloning the fork (Rename `username` and `repo`)

```console
$ git clone https://github.com/username/repo.git#bot
```

-   Install Development Packages

**NPM**

```console
$ npm install --save-dev
```

**Yarn**

```console
$ yarn add --dev
```

-   Fill required credentials in [`.env.example`](.env.example) and rename it to `.env.development`

-   Change necessary things in [`settings.yaml`](settings.yaml)

-   Running Development Bot (Auto builds and runs)

**NPM**

```console
$ npm run dev
```

**Yarn**

```console
$ yarn dev
```

-   Before committing a Push (Make sure to fix SemVer conflicts)

**NPM**

```console
$ npm run push
```

**Yarn**

```console
$ yarn push
```

## License

[Click here](LICENSE)
