const path = require('path');

const baseUrl = 'http://localhost:3000';

module.exports = {
  viewPath: path.resolve('views'),
  oidp: {
    baseUrl,
    path: '/oidc',
    jwtAlg: 'RS256',
    oidc: {
      clients: [
        {
          client_id: 'test',
          client_secret: 'testsecret',
          application_type: 'web',
          redirect_uris: ['http://localhost:8080/session/callback'],
        },
      ],
      claims: {
        address: ['address'],
        email: ['email', 'email_verified'],
        phone: ['phone_number', 'phone_number_verified'],
        profile: [
          'birthdate',
          'family_name',
          'gender',
          'given_name',
          'locale',
          'middle_name',
          'name',
          'nickname',
          'picture',
          'preferred_username',
          'profile',
          'updated_at',
          'website',
          'zoneinfo',
        ],
      },
      features: {
        devInteractions: {enabled: false},
        deviceFlow: {enabled: true}, // defaults to false
        revocation: {enabled: true}, // defaults to false

        introspection: {enabled: true},
        // jwtIntrospection: {enabled: true},
      },
      responseTypes: ['code'],
      pkce: {
        methods: ['S256'],
        required: () => false,
      },
      ttl: {
        AccessToken: 60 * 60,
        AuthorizationCode: 10 * 60,
        BackchannelAuthenticationRequest: 10 * 60,
        ClientCredentials: 10 * 60,
        DeviceCode: 10 * 60,
        Grant: 14 * 24 * 60 * 60,
        IdToken: 60 * 60,
        Interaction: 60 * 60,
        RefreshToken: 14 * 24 * 60 * 60,
        Session: 14 * 24 * 60 * 60,
      },
    },
  },
};
