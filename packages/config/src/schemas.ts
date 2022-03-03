import * as t from '@jil/common/optimal';
import {Blueprint} from '@jil/common/optimal';
import {ApplicationConfig} from '@loopback/core';

export const ShutdownSignals: NodeJS.Signals[] = [
  'SIGABRT',
  'SIGALRM',
  'SIGBUS',
  'SIGCHLD',
  'SIGCONT',
  'SIGFPE',
  'SIGHUP',
  'SIGILL',
  'SIGINT',
  'SIGIO',
  'SIGIOT',
  'SIGKILL',
  'SIGPIPE',
  'SIGPOLL',
  'SIGPROF',
  'SIGPWR',
  'SIGQUIT',
  'SIGSEGV',
  'SIGSTKFLT',
  'SIGSTOP',
  'SIGSYS',
  'SIGTERM',
  'SIGTRAP',
  'SIGTSTP',
  'SIGTTIN',
  'SIGTTOU',
  'SIGUNUSED',
  'SIGURG',
  'SIGUSR1',
  'SIGUSR2',
  'SIGVTALRM',
  'SIGWINCH',
  'SIGXCPU',
  'SIGXFSZ',
  'SIGBREAK',
  'SIGLOST',
  'SIGINFO',
];

export const ApplicationConfigSchema: Blueprint<ApplicationConfig> = {
  name: t.string().undefinable(),
  shutdown: t
    .shape({
      signals: t.array([]).of(t.string().oneOf(ShutdownSignals)).undefinable(),
      gracePeriod: t.number().undefinable(),
    })
    .undefinable(),
};
