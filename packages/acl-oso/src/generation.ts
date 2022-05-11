import {TextWriter} from '@yellicode/core';
import {ValueOrPromise} from '@loopback/context';
import {BufferWriter} from 'memstreams';
import {StreamWriter} from '@obcode/templating';
import {DomainSecurity, PolarActor, PolarResource} from './types';
import isEmpty from 'tily/is/empty';
import camelCaseName from 'tily/string/camelCaseName';

export type GenerateScriptCallback = (writer: TextWriter) => ValueOrPromise<void>;

export async function generate(callback: GenerateScriptCallback): Promise<string> {
  const stream = new BufferWriter();
  await callback(new StreamWriter(stream));
  return stream.data.toString();
}

export function generateActorScripts(writer: TextWriter, resource: PolarActor) {
  generateBlockScripts('actor', writer, resource);
}

export function generateResourceScripts(writer: TextWriter, resource: PolarResource) {
  generateBlockScripts('resource', writer, resource);
}

export function generateBlockScripts(type: string, writer: TextWriter, domain: DomainSecurity) {
  writer.writeLine(`${type} ${domain.name} {`);
  writer.increaseIndent();

  if (domain.roles) {
    writeInlineRoles(writer, domain.roles);
  }

  if (domain.permissions) {
    writeInlinePermissions(writer, domain.permissions);
  }

  if (!isEmpty(domain.relations)) {
    writeInlineRelations(writer, domain.relations!);
  }

  if (domain.rolePermissions) {
    writeInlineRules(writer, domain.rolePermissions);
  }

  if (domain.roleInherits) {
    writeInlineRules(writer, domain.roleInherits);
  }

  writer.decreaseIndent();
  writer.writeLine('}');

  // relations mapping
  if (!isEmpty(domain.relations)) {
    writeHasRelations(writer, domain.relations!, domain);
  }
}

function writeInlineRoles(writer: TextWriter, roles: string[]) {
  writer.writeLine(`roles = [${roles.map(r => `"${r}"`).join(', ')}];`);
}

function writeInlinePermissions(writer: TextWriter, permissions: string[]) {
  writer.writeLine(`permissions = [${permissions.map(p => `"${p}"`).join(', ')}];`);
}

function writeInlineRelations(
  writer: TextWriter,
  relations: Record<string, {model: string; property?: string} | string>,
) {
  const content = Object.entries(relations)
    .map(([name, relation]) => `${name}: ${typeof relation === 'string' ? relation : relation.model}`)
    .join(', ');
  writer.writeLine(`relations = {${content}};`);
}

function writeInlineRules(writer: TextWriter, rules: Record<string, string[]>) {
  for (const [key, values] of Object.entries(rules)) {
    const parts = key.split('@');
    const roleName = parts[0];
    const parentName = parts[1];
    for (const value of values) {
      let line = `"${value}" if "${roleName}"`;
      if (parentName) {
        line += ` on "${parentName}"`;
      }
      line += ';';
      writer.writeLine(line);
    }
  }
}

function writeHasRelations(
  writer: TextWriter,
  relations: Record<string, {model: string; property?: string} | string>,
  domain: DomainSecurity,
) {
  for (const [name, relation] of Object.entries(relations)) {
    const model = typeof relation === 'string' ? relation : relation.model;
    const property = typeof relation === 'string' || !relation.property ? relation : relation.property;
    const modelVar = camelCaseName(model);
    writer.writeLine(`has_relation(${modelVar}: ${model}, "${name}", _: ${domain.name}{${property}: ${modelVar}});`);
  }
}
