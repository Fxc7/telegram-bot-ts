# Telegram Bot TS

## Instalation

### with npm installed

```bash
npm install --save-dev typescript && npm install && npm start
```

### with pnpm installed

```bash
pnpm install --save-dev typescript && pnpm install && pnpm start
```

### with yarn installed

```bash
yarn add --save-dev typescript && yarn install && yarn run start
```

## Structure base

```bash
└── telegram-bot-ts
    └── 📁callback
        └── inputText.ts
    └── 📁command
        └── 📁Downloader
            └── instagram.ts
            └── tiktok.ts
        └── 📁Maker
            └── affect.ts
            └── biden.ts
            └── caution.ts
            └── drake.ts
            └── funfacts.ts
            └── kannagen.ts
            └── removebg.ts
            └── rip.ts
    └── 📁configs
        └── env.ts
        └── regex.ts
    └── 📁database
        └── allCommands.json
        └── commands.json
    └── 📁library
        └── client.ts
        └── functions.ts
        └── service.ts
    └── 📁types
        └── global.d.ts
        └── index.ts
    └── .gitignore
    └── index.ts
    └── loadCommand.ts
    └── markdownlint.config
    └── package.json
    └── README.md
    └── tsconfig.json
```

## Authors

- [@Farhannnn](https://www.github.com/Fxc7)
