jest.mock('node-vault', () => {
  return () => ({
    health: jest.fn().mockImplementation(() => ({promise: () => Promise.resolve()})),
    init: jest.fn().mockImplementation(() => ({keys: 'dummykeys', root_token: 'token'})),
    unseal: jest.fn().mockImplementation(() => ({promise: () => Promise.resolve()})),
    seal: jest.fn().mockImplementation(() => ({promise: () => Promise.resolve()})),
    help: jest.fn().mockImplementation(() => ({promise: () => Promise.resolve()})),
    write: jest.fn().mockImplementation(() => ({promise: () => Promise.resolve()})),
    read: jest.fn().mockImplementation(() => ({promise: () => Promise.resolve()})),
    list: jest.fn().mockImplementation(() => ({promise: () => Promise.resolve()})),
    delete: jest.fn().mockImplementation(() => ({promise: () => Promise.resolve()})),
    status: jest.fn().mockImplementation(() => ({promise: () => Promise.resolve()})),
    initialized: jest.fn().mockImplementation(() => ({promise: () => Promise.resolve()})),
    generateRootStatus: jest.fn().mockImplementation(() => ({promise: () => Promise.resolve()})),
    generateRootInit: jest.fn().mockImplementation(() => ({promise: () => Promise.resolve()})),
    generateRootCancel: jest.fn().mockImplementation(() => ({promise: () => Promise.resolve()})),
    generateRootUpdate: jest.fn().mockImplementation(() => ({promise: () => Promise.resolve()})),
    mounts: jest.fn().mockImplementation(() => ({promise: () => Promise.resolve()})),
    mount: jest.fn().mockImplementation(() => ({promise: () => Promise.resolve()})),
    unmount: jest.fn().mockImplementation(() => ({promise: () => Promise.resolve()})),
    remount: jest.fn().mockImplementation(() => ({promise: () => Promise.resolve()})),
    policies: jest.fn().mockImplementation(() => ({promise: () => Promise.resolve()})),
    addPolicy: jest.fn().mockImplementation(() => ({promise: () => Promise.resolve()})),
    getPolicy: jest.fn().mockImplementation(() => ({promise: () => Promise.resolve()})),
    removePolicy: jest.fn().mockImplementation(() => ({promise: () => Promise.resolve()})),
    auths: jest.fn().mockImplementation(() => ({promise: () => Promise.resolve()})),
    enableAuth: jest.fn().mockImplementation(() => ({promise: () => Promise.resolve()})),
    disableAuth: jest.fn().mockImplementation(() => ({promise: () => Promise.resolve()})),
    audits: jest.fn().mockImplementation(() => ({promise: () => Promise.resolve()})),
    enableAudit: jest.fn().mockImplementation(() => ({promise: () => Promise.resolve()})),
    disableAudit: jest.fn().mockImplementation(() => ({promise: () => Promise.resolve()})),
    renew: jest.fn().mockImplementation(() => ({promise: () => Promise.resolve()})),
    revoke: jest.fn().mockImplementation(() => ({promise: () => Promise.resolve()})),
    revokePrefix: jest.fn().mockImplementation(() => ({promise: () => Promise.resolve()})),
    rotate: jest.fn().mockImplementation(() => ({promise: () => Promise.resolve()})),
    githubLogin: jest.fn().mockImplementation(() => ({promise: () => Promise.resolve()})),
    userpassLogin: jest.fn().mockImplementation(() => ({promise: () => Promise.resolve()})),
    kubernetesLogin: jest.fn().mockImplementation(() => ({promise: () => Promise.resolve()})),
    awsIamLogin: jest.fn().mockImplementation(() => ({promise: () => Promise.resolve()})),
    tokenAccessors: jest.fn().mockImplementation(() => ({promise: () => Promise.resolve()})),
    tokenCreate: jest.fn().mockImplementation(() => ({promise: () => Promise.resolve()})),
    tokenCreateOrphan: jest.fn().mockImplementation(() => ({promise: () => Promise.resolve()})),
    tokenCreateRole: jest.fn().mockImplementation(() => ({promise: () => Promise.resolve()})),
    tokenLookup: jest.fn().mockImplementation(() => ({promise: () => Promise.resolve()})),
    tokenLookupAccessor: jest.fn().mockImplementation(() => ({promise: () => Promise.resolve()})),
    tokenLookupSelf: jest.fn().mockImplementation(() => ({promise: () => Promise.resolve()})),
    tokenRenewSelf: jest.fn().mockImplementation(() => ({promise: () => Promise.resolve()})),
    tokenRenew: jest.fn().mockImplementation(() => ({promise: () => Promise.resolve()})),
    tokenRevoke: jest.fn().mockImplementation(() => ({promise: () => Promise.resolve()})),
    tokenRevokeAccessor: jest.fn().mockImplementation(() => ({promise: () => Promise.resolve()})),
    tokenRevokeOrphan: jest.fn().mockImplementation(() => ({promise: () => Promise.resolve()})),
    tokenRevokeSelf: jest.fn().mockImplementation(() => ({promise: () => Promise.resolve()})),
    tokenRoles: jest.fn().mockImplementation(() => ({promise: () => Promise.resolve()})),
    addTokenRole: jest.fn().mockImplementation(() => ({promise: () => Promise.resolve()})),
    getTokenRole: jest.fn().mockImplementation(() => ({promise: () => Promise.resolve()})),
    removeTokenRole: jest.fn().mockImplementation(() => ({promise: () => Promise.resolve()})),
    approleRoles: jest.fn().mockImplementation(() => ({promise: () => Promise.resolve()})),
    addApproleRole: jest.fn().mockImplementation(() => ({promise: () => Promise.resolve()})),
    getApproleRole: jest.fn().mockImplementation(() => ({promise: () => Promise.resolve()})),
    deleteApproleRole: jest.fn().mockImplementation(() => ({promise: () => Promise.resolve()})),
    getApproleRoleId: jest.fn().mockImplementation(() => ({promise: () => Promise.resolve()})),
    updateApproleRoleId: jest.fn().mockImplementation(() => ({promise: () => Promise.resolve()})),
    getApproleRoleSecret: jest.fn().mockImplementation(() => ({promise: () => Promise.resolve()})),
    approleSecretAccessors: jest.fn().mockImplementation(() => ({promise: () => Promise.resolve()})),
    approleSecretLookup: jest.fn().mockImplementation(() => ({promise: () => Promise.resolve()})),
    approleSecretDestroy: jest.fn().mockImplementation(() => ({promise: () => Promise.resolve()})),
    approleSecretAccessorLookup: jest.fn().mockImplementation(() => ({promise: () => Promise.resolve()})),
    approleSecretAccessorDestroy: jest.fn().mockImplementation(() => ({promise: () => Promise.resolve()})),
    approleLogin: jest.fn().mockImplementation(() => ({promise: () => Promise.resolve()})),
    leader: jest.fn().mockImplementation(() => ({promise: () => Promise.resolve()})),
    stepDown: jest.fn().mockImplementation(() => ({promise: () => Promise.resolve()})),
    encryptData: jest.fn().mockImplementation(() => ({promise: () => Promise.resolve()})),
    decryptData: jest.fn().mockImplementation(() => ({promise: () => Promise.resolve()})),
    generateDatabaseCredentials: jest.fn().mockImplementation(() => ({promise: () => Promise.resolve()})),
  });
});
