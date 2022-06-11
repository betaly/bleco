# @bleco/config

[![LoopBack](<https://github.com/loopbackio/loopback-next/raw/master/docs/site/imgs/branding/Powered-by-LoopBack-Badge-(blue)-@2x.png>)](http://loopback.io/)

> A loopback-next configuration loading utility

## Features

- load config files with [@jil/config](https://github.com/jiljs/jil/tree/master/packages/config)
- merge environments with [read-env](https://github.com/yatki/read-env)

## Usage

load config from some directory and merge environments with [read-env](https://github.com/yatki/read-env)

```yaml
# <dir>/test.config.yaml

name: hello
foo: bar
deep:
  object:
    property: value
```

```ts
process.env.TEST_DEEP__OBJECT__INT_ZERO = '0';

const loader = new ConfigLoader('test');

// load config from directory and merge environments with `read-env`
const config = await loader.load('<dir>');
// or leave arg empty and run in `<dir>`
// const config = await loader.load();

console.log(config);

// =>
// {
//   name: 'hello',
//   foo: 'bar',
//   deep: {
//     object: {
//       property: 'value',
//       intZero: 0
//     }
//   }
// }
```

## Feedback

If you've noticed a bug or have a question or have a feature request,
[search the issue tracker](https://github.com/betaly/bleco/issues) to see if someone else in the community has already
created a ticket. If not, go ahead and [make one](https://github.com/betaly/bleco/issues/new/choose)! All feature
requests are welcome. Implementation time may vary. Feel free to contribute the same, if you can. If you think this
extension is useful, please [star](https://help.github.com/en/articles/about-stars) it. Appreciation really helps in
keeping this project alive.

## Contributing

Please read [CONTRIBUTING.md](https://github.com/betaly/bleco/blob/master/.github/CONTRIBUTING.md) for details on the
process for submitting pull requests to us.

## Code of conduct

Code of conduct guidelines [here](https://github.com/betaly/bleco/blob/master/.github/CODE_OF_CONDUCT.md).

## License

[MIT](LICENSE)
