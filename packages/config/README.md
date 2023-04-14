# @bleco/config

[![LoopBack](<https://github.com/loopbackio/loopback-next/raw/master/docs/site/imgs/branding/Powered-by-LoopBack-Badge-(blue)-@2x.png>)](http://loopback.io/)

> A loopback-next configuration loading utility

## Features

- load config files with [@boost/config](https://www.npmjs.com/package/@boost/config)
- resolve variables in config with [@codexsoft/dotenv-flow](https://www.npmjs.com/package/@codexsoft/dotenv-flow)

## Usage

`demo.config.yaml`

```yaml
name: hello
foo:
  bar:
    a: ${FOO_BAR_A}
    b: ${FOO_BAR_B}
    c: ${FOO_BAR_C}
    d: ${FOO_BAR_D}
deep:
  object:
    property: value
```

`.env.default`

```dotenv
FOO_BAR_A=foo_bar_1
FOO_BAR_B=foo_bar_2
```

`.env`

```dotenv
FOO_BAR_A=foo_bar_3
FOO_BAR_C=foo_bar_4
```

```ts
import {load} from '@bleco/config';

// load config from directory and merge environments with `read-env`
const config = await load('demo', '<dir>');
// or leave arg empty and run in `<dir>`
// const config = await load('demo');

console.log(config);

//=>
//{
//  "name": "hello",
//  "foo": {
//    "bar": {
//      "a": "foo_bar_3",
//      "b": "foo_bar_2",
//      "c": "foo_bar_4",
//      "d": "${FOO_BAR_D}"
//    }
//  },
//  "deep": {
//    "object": {
//      "property": "value"
//    }
//  }
//}
```

## [`.env.*` files](https://github.com/codexsoft/dotenv-flow/blob/main/README.md#files-under-version-control)

You can have the following `.env*` files in your project:

- `.env.default` – for default (fallback) values, **tracked** by VCS
- `.env` – for default production values, **tracked** by VCS
- `.env.development` – for development environment, **tracked** by VCS
- `.env.test` – for test environment, **tracked** by VCS
- `.env.production` – for production environment, **tracked** by VCS
- `.env.local` – for individual default values, **ignored** by VCS
- `.env.development.local` – for individual development environment values, **ignored** by VCS
- `.env.test.local` – for individual test environment values, **ignored** by VCS
- `.env.production.local` – for production environment values (DB passwords, API keys, etc.), **ignored** by VCS

## [config files](https://boostlib.dev/docs/config#config-files)

### File patterns

Config files are grouped into either the root or branch category. The root of a project is denoted by a root
`*.config.*` file, or a folder with the name `.config`, which contains config files. Branch config files are located
within folders (at any depth) below the root, and are prefixed with a leading dot (`.`).

| Root                                                      | Branch                |
| --------------------------------------------------------- | --------------------- |
| `.config/<name>.<ext>`, `<name>.config.<ext>`             | `.<name>.<ext>`       |
| `.config/<name>.<env>.<ext>`, `<name>.config.<env>.<ext>` | `.<name>.<env>.<ext>` |

- `<name>` - Name passed to your [`Configuration`][configuration] instance (in camel case).
- `<env>` - Current environment derived from `NODE_ENV`.
- `<ext>` - File extension supported by the defined [loaders and extensions](#finder-options).

#### Lookup resolution

When the finder traverses through the file system and attempts to resolve config files within each/target folder, it
does so using the lookup algorithm demonstrated below. Let's assume the following:

- The config file name is `app`.
- All file formats are supported, in their default lookup order (js, json, cjs, mjs, ts, json5, yaml, yml).
- The current environment is `development` (the value of `NODE_ENV`).

```
app.js
app.development.js
app.json
app.development.json
app.cjs
app.development.cjs
app.mjs
app.development.mjs
app.ts
app.development.ts
app.json5
app.development.json5
app.yaml
app.development.yaml
app.yml
app.development.yml
```

## Roadmap

- Implementing an enhanced
  [parameter expansion syntax](https://docs.docker.com/compose/environment-variables/env-file/#parameter-expansion)

## License

[MIT](LICENSE)
