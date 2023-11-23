# @bleco/sanitization

> A LoopBack 4 project for securely filtering sensitive fields from API responses, featuring custom decorators and
> global interceptors to enhance data privacy and security in RESTful services.

## Overview

The Sanitization component adds a global interceptor to your LoopBack 4 application, enabling you to specify
sanitization metadata on controller methods. This metadata determines how response data should be filtered before being
sent back to the client. It supports both inclusion and exclusion of fields, as well as handling nested response
structures.

## Installation

Run the following command to install Sanitization component in your LoopBack 4 project:

```sh
npm install @bleco/sanitization
```

## Usage

After installing the component, you need to add it to your LoopBack 4 application.

```typescript
import { SanitizationComponent } from "@bleco/sanitization";

export class MyApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication))
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Add Sanitization component to your application
    this.component(SanitizationComponent);

    // ... other configurations ...
  }
}
```

### Decorator

Use the `@sanitize` decorator in your controller methods to specify the sanitization rules.

```typescript
import { sanitize } from '@bleco/sanitization';

export class MyController {
  @get('/my-route')
  @sanitize({ exclude: ['password', 'secretField'] })
  async myMethod() {
    return {
      username: 'user1',
      password: 'password123',
      secretField: 'someSecret',
      publicField: 'publicInfo'
    };
  }
}
```

## Configuration

### Sanitization Metadata

- `include`: Array of fields that should be included in the response.
- `exclude`: Array of fields that should be excluded from the response.
- `key`: Optional path to the result in the response object (useful for nested structures).
