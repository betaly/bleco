import {Application, ApplicationConfig} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {OidpBindings} from '../../keys';
import {OidpComponent} from '../../oidp.component';
import {OidcDataSourceName} from '../../types';
import {testdb} from '../support';

describe('OidpComponent', function () {
  describe('OidpComponent with KvAdapter', function () {
    let app: Application;

    beforeAll(givenAppWithCustomConfig);

    it('binds config', async () => {
      expect(app.isBound(OidpBindings.CONFIG)).toBeDefined();
      const config = await app.get(OidpBindings.CONFIG);
      expect(config).toBeInstanceOf(Object);
      expect(config.baseUrl).toBe('https://oidp.example.com');
    });

    it('binds a adapter factory', async () => {
      expect(app.isBound(OidpBindings.ADAPTER_FACTORY)).toBeDefined();
      const adapterFactory = await app.get(OidpBindings.ADAPTER_FACTORY);
      expect(adapterFactory).toBeInstanceOf(Function);
    });

    async function givenAppWithCustomConfig() {
      app = givenApplication({
        oidp: {
          baseUrl: 'https://oidp.example.com',
        },
      });
      app.bind(`datasources.${OidcDataSourceName}`).to(testdb);
      app.component(OidpComponent);
    }
  });

  describe('OidpComponent without KvAdapter', function () {
    let app: Application;

    beforeAll(givenAppWithCustomConfig);

    it('binds config', async () => {
      expect(app.isBound(OidpBindings.CONFIG)).toBeDefined();
      const config = await app.get(OidpBindings.CONFIG);
      expect(config).toBeInstanceOf(Object);
      expect(config.baseUrl).toBe('https://oidp.example.com');
    });

    it('binds a adapter factory', async () => {
      expect(app.isBound(OidpBindings.ADAPTER_FACTORY)).toBeDefined();
      const adapterFactory = await app.get(OidpBindings.ADAPTER_FACTORY, {optional: true});
      expect(adapterFactory).toBeUndefined();
    });

    async function givenAppWithCustomConfig() {
      app = givenApplication({
        oidp: {
          baseUrl: 'https://oidp.example.com',
        },
      });
      app.configure(OidpBindings.COMPONENT).to({
        enableDbAdapter: false,
      });
      app.component(OidpComponent);
    }
  });
});

class TestApplication extends RepositoryMixin(RestApplication) {}
function givenApplication(config: ApplicationConfig = {}) {
  return new TestApplication(config);
}
