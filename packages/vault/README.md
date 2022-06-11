# @bleco/vault

> A loopback-next extension for HashiCorp's Vault integration in loopback-next applications
> 
> This package is forked from [loopback4-vault](https://github.com/sourcefuse/loopback4-vault)

## Install

```sh
npm install @bleco/vault
```

## Usage

In order to use this component into your LoopBack application, please follow below steps.

- Add component to application and provide vault endpoint, vault token and unseal key via `VaultSecurityBindings`.

```ts
this.component(VaultComponent);
this.bind(VaultSecurityBindings.CONFIG).to({
  endpoint: process.env.VAULT_URL,
  token: process.env.VAULT_TOKEN,
  unsealKey: process.env.VAULT_UNSEAL_KEY,
});
```

- After this, you can just inject the `VaultSecurityBindings.VAULT_CONNECTOR` across application.

```ts
class SomeClass {
  constructor(
    @inject(VaultSecurityBindings.VAULT_CONNECTOR)
    private readonly vaultConnector: VaultConnect,
  ) {
    //...
  }
}
```

All the methods mentioned [here](https://github.com/kr1sp1n/node-vault/blob/master/features.md) are now available on
`vaultConnector`.

Here is an example usage below

```ts
class SomeClass {
  private async upsertKeyToVault(credKey: string): Promise<{data: AnyObject}> {
    let data: {data: AnyObject};
    try {
      data = await this.vaultConnector.read(credKey);
    } catch (error) {
      if (error.response.statusCode === 404) {
        await this.vaultConnector.write(credKey, {empty: true});
        data = await this.vaultConnector.read(credKey);
      } else {
        this.logger.error(error);
        throw error;
      }
    }
    return data;
  }
}
```

- If you need to update vault token or any other connection parameters, there is a
  `reconnect(config: VaultProviderOptions)` function available to do so. Whatever new config parameters are needed, you
  can pass those and leave the unchanged ones out of the config. It will only update the new ones keeping the existing
  ones intact and will reconnect with vault again. Please note that this may cause disconnection with your existing
  vault data if you change the endpoints here.

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

## Credits

- [SourceFuse](https://github.com/sourcefuse)
