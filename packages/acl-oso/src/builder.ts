// import toArray from 'tily/array/toArray';
// import isEmpty from 'tily/is/empty';
// import {OsoPolicy, PolarActor, PolarResource, PolarResourceContent} from './types';
// import {generate, generateActorScripts, generateResourceScripts} from './generation';
//
// export class OsoPolicyBuilder {
//   readonly actors: Record<string, PolarActor> = {};
//   readonly resources: Record<string, PolarResource> = {};
//   readonly rules: string[] = [];
//
//   get policy(): OsoPolicy {
//     return {
//       actors: {...this.actors},
//       resources: {...this.resources},
//       rules: [...this.rules],
//     };
//   }
//
//   addActors(actors: Record<string, PolarResourceContent>): void {
//     for (const name in actors) {
//       this.actors[name] = {...actors[name], name};
//     }
//   }
//
//   addResources(resources: Record<string, PolarResourceContent>): void {
//     for (const name in resources) {
//       this.resources[name] = {...resources[name], name};
//     }
//   }
//
//   addRules(polar: string | string[]): void {
//     this.rules.push(...toArray(polar));
//   }
//
//   hasPolicies(): boolean {
//     return !isEmpty(this.actors) || !isEmpty(this.resources) || !isEmpty(this.rules);
//   }
//
//   async build(): Promise<string> {
//     if (!this.hasPolicies()) {
//       return '';
//     }
//     return generate(writer => {
//       writer.writeLine('# generated by oso-policy-builder');
//       writer.writeLine('allow(principal, action, resource) if has_permission(principal, action, resource);');
//       Object.values(this.actors).forEach(a => generateActorScripts(writer, a));
//       Object.values(this.resources).forEach(a => generateResourceScripts(writer, a));
//       this.rules.forEach(p => writer.write(p));
//     });
//   }
// }