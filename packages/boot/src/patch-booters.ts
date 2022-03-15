import {
  ArtifactOptions,
  ControllerDefaults,
  DataSourceDefaults,
  InterceptorProviderDefaults,
  LifeCycleObserverDefaults,
  ModelDefaults,
  RepositoryDefaults,
  RestDefaults,
  ServiceDefaults,
} from '@loopback/boot';

export const BooterDefaultArtifactOptions = [
  ControllerDefaults,
  DataSourceDefaults,
  InterceptorProviderDefaults,
  LifeCycleObserverDefaults,
  ModelDefaults,
  RestDefaults,
  RepositoryDefaults,
  ServiceDefaults,
];

export function patchBooterDefaultArtifactOptionsExtensions() {
  BooterDefaultArtifactOptions.forEach(patchArtifactExtensions);
}

function patchArtifactExtensions(defaults: ArtifactOptions) {
  if (!defaults.extensions) return;
  const extensions = Array.isArray(defaults.extensions) ? defaults.extensions : [defaults.extensions];
  const modified: string[] = [];
  for (let ext of extensions) {
    if (ext.endsWith('.js')) {
      ext = ext.substring(0, ext.length - 3) + '.[jt]s';
    }
    modified.push(ext);
  }
  defaults.extensions = modified;
}
