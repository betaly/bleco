import {Application, Context, invokeMethod} from '@loopback/core';
import {SanitizationComponent} from '../../sanitization-component';
import {sanitize} from '../../decorators/sanitize';

describe('Sanitization', () => {
  let app: Application;
  let reqCtx: Context;
  let controller: TestController;

  beforeAll(givenApplicationAndAuthorizer);
  beforeEach(givenRequestContext);

  it('should sanitize response data for exclude', async () => {
    const data = await invokeMethod(controller, 'testEndpointWithExclude', reqCtx, []);

    // Verify the response
    expect(data).toEqual({username: 'test', email: 'test@example.com'});
    expect(data.password).toBeUndefined();
  });

  it('should sanitize response data for include only', async () => {
    const data = await invokeMethod(controller, 'testEndpointWithInclude', reqCtx, []);

    // Verify the response
    expect(data).toEqual({username: 'test', email: 'test@example.com'});
    expect(data.password).toBeUndefined();
  });

  it('should sanitize response data for include and exclude', async () => {
    const data = await invokeMethod(controller, 'testEndpointWithIncludeAndExclude', reqCtx, []);

    // Verify the response
    expect(data).toEqual({username: 'test'});
    expect(data.email).toBeUndefined();
    expect(data.password).toBeUndefined();
  });

  it('should sanitize response data for multiple include and exclude', async () => {
    const data = await invokeMethod(controller, 'testEndpointWithMultipleIncludeAndExclude', reqCtx, []);

    // Verify the response
    expect(data).toEqual({username: 'test', email: 'test@example.com', address: '123 Main St'});
    expect(data.deleted).toBeUndefined();
    expect(data.password).toBeUndefined();
  });

  it('should sanitize response data for no data', async () => {
    const data = await invokeMethod(controller, 'testEndpointWithNoData', reqCtx, []);

    // Verify the response
    expect(data).toEqual({});
  });

  it('should sanitize response data for array', async () => {
    const data = await invokeMethod(controller, 'testEndpointWithArray', reqCtx, []);

    // Verify the response
    expect(data).toEqual([
      {username: 'test1', email: 'test1@example.com'},
      {username: 'test2', email: 'test2@example.com'},
    ]);
    expect(data[0].password).toBeUndefined();
    expect(data[1].password).toBeUndefined();
  });

  it('should sanitize response data for nested data', async () => {
    const data = await invokeMethod(controller, 'testEndpointWithNestedData', reqCtx, []);

    // Verify the response
    expect(data).toEqual({
      data: [
        {username: 'test1', email: 'test1@example.com'},
        {username: 'test2', email: 'test2@example.com'},
      ],
    });
    expect(data.data[0].password).toBeUndefined();
    expect(data.data[1].password).toBeUndefined();
  });

  function givenApplicationAndAuthorizer() {
    app = new Application();
    app.component(SanitizationComponent);
  }

  function givenRequestContext() {
    reqCtx = new Context(app);
    controller = new TestController();
  }

  class TestController {
    @sanitize({exclude: ['password']})
    async testEndpointWithExclude() {
      return {username: 'test', password: 'secret', email: 'test@example.com'};
    }

    @sanitize({include: ['username', 'email']})
    async testEndpointWithInclude() {
      return {username: 'test', password: 'secret', email: 'test@example.com'};
    }

    @sanitize({include: ['username', 'password'], exclude: ['password']})
    async testEndpointWithIncludeAndExclude() {
      return {username: 'test', password: 'secret', email: 'test@example.com'};
    }

    @sanitize({include: ['username', 'email'], exclude: ['password']})
    @sanitize({include: ['email', 'address'], exclude: ['deleted']})
    async testEndpointWithMultipleIncludeAndExclude() {
      return {username: 'test', password: 'secret', email: 'test@example.com', address: '123 Main St', deleted: false};
    }

    @sanitize({exclude: ['password']})
    async testEndpointWithNoData() {
      return {};
    }

    @sanitize({exclude: ['password']})
    async testEndpointWithArray() {
      return [
        {username: 'test1', password: 'secret1', email: 'test1@example.com'},
        {username: 'test2', password: 'secret2', email: 'test2@example.com'},
      ];
    }

    @sanitize({exclude: ['password'], key: 'data'})
    async testEndpointWithNestedData() {
      return {
        data: [
          {username: 'test1', password: 'secret1', email: 'test1@example.com'},
          {username: 'test2', password: 'secret2', email: 'test2@example.com'},
        ],
      };
    }
  }
});
