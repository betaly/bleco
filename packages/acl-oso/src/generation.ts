import {TextWriter} from '@yellicode/core';
import {ValueOrPromise} from '@loopback/context';
import {BufferWriter} from 'memstreams';
import {StreamWriter} from '@obcode/templating';
import isEmpty from 'tily/is/empty';
import camelCaseName from 'tily/string/camelCaseName';
import {Policy} from '@bleco/acl';

export type AnyPolicy = Omit<Policy, 'type'>;

export type GenerateScriptCallback = (writer: TextWriter) => ValueOrPromise<void>;

export async function generate(callback: GenerateScriptCallback): Promise<string> {
  const stream = new BufferWriter();
  await callback(new StreamWriter(stream));
  return stream.data.toString();
}

export function generateActorScripts(writer: TextWriter, resource: AnyPolicy) {
  generateBlockScripts('principal', writer, resource);
}

export function generateResourceScripts(writer: TextWriter, resource: AnyPolicy) {
  generateBlockScripts('resource', writer, resource);
}

export function generateBlockScripts(type: string, writer: TextWriter, policy: AnyPolicy) {
  writer.writeLine(`${type} ${policy.model.name} {`);
  writer.increaseIndent();

  if (policy.roles) {
    writeInlineRoles(writer, policy.roles);
  }

  if (policy.permissions) {
    writeInlinePermissions(writer, policy.permissions);
  }

  if (policy.relations && !isEmpty(policy.relations)) {
    writeInlineRelations(writer, policy.relations, policy);
  }

  if (policy.rolePermissions) {
    writeInlineRules(writer, policy.rolePermissions);
  }

  if (policy.roleInherits) {
    writeInlineRules(writer, policy.roleInherits);
  }

  writer.decreaseIndent();
  writer.writeLine('}');

  // relations mapping
  if (policy.relations && !isEmpty(policy.relations)) {
    writeHasRelations(writer, policy.relations, policy);
  }

  if (policy.rules) {
    policy.rules.forEach((rule: string) => writer.writeLine(rule));
  }
}

function writeInlineRoles(writer: TextWriter, roles: string[]) {
  writer.writeLine(`roles = [${roles.map(r => `"${r}"`).join(', ')}];`);
}

function writeInlinePermissions(writer: TextWriter, permissions: string[]) {
  writer.writeLine(`permissions = [${permissions.map(p => `"${p}"`).join(', ')}];`);
}

function writeInlineRelations(writer: TextWriter, relations: string[], policy: AnyPolicy) {
  const definition = policy.model.definition;
  const content = relations.map(r => `${r}: ${definition.relations[r].target().name}`).join(', ');
  writer.writeLine(`relations = {${content}};`);
}

function writeInlineRules(writer: TextWriter, rules: Record<string, string[]>) {
  for (const [key, values] of Object.entries(rules)) {
    const [name, parent] = parseRoleName(key);
    for (const value of values) {
      let line = `"${value}" if "${name}"`;
      if (parent) {
        line += ` on "${parent}"`;
      }
      line += ';';
      writer.writeLine(line);
    }
  }
}

function writeHasRelations(writer: TextWriter, relations: string[], policy: AnyPolicy) {
  const model = policy.model;
  for (const name of relations) {
    const target = policy.model.definition.relations[name].target();
    const property = name;
    const targetVal = camelCaseName(target.name);
    writer.writeLine(
      `has_relation(${targetVal}: ${target.name}, "${name}", _: ${model.name}{${property}: ${targetVal}});`,
    );
  }
}

function parseRoleName(roleName: string): [name: string, parent?: string] {
  if (roleName.includes('@')) {
    const parts = roleName.split('@');
    return [parts[0], parts[1]];
  } else if (roleName.includes('.')) {
    const parts = roleName.split('.');
    return [parts[1], parts[0]];
  }
  return [roleName];
}
