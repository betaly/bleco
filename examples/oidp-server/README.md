# @bleco/example-oidp-server

> An example OIDC server for LoopBack 4

## Testing

We can test it using [OIDC-Tester](https://gitlab.com/guenoledc-perso/idp-oidc-tester) with the following configs:

```json
{
  "issuer": "http://localhost:3000/oidc/.well-known/openid-configuration",
  "name": "bleco-example",
  "client": {
    "clientId": "test",
    "clientSecret": "testsecret",
    "scope": "openid profile"
  }
}
```

or using `OIDC-Tester` in docker

```json
{
  "issuer": "http://host.docker.internal:3000/oidc/.well-known/openid-configuration",
  "name": "bleco-example",
  "client": {
    "clientId": "test",
    "clientSecret": "testsecret",
    "scope": "openid profile"
  }
}
```

Builtin demo users:

| Username | Password |
| -------- | -------- |
| john     | test     |
| jane     | test     |
| bob      | test     |
