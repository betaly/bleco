import {TextWriter} from '@obcode/templating';
import isEmpty from 'tily/is/empty';
import camelCaseName from 'tily/string/camelCaseName';
import {PolarResource} from './types';

export function generateResourceScripts(writer: TextWriter, resource: PolarResource) {
  generateResourceBlockScripts(writer, resource);
}

export function generateResourceBlockScripts(writer: TextWriter, resource: PolarResource) {
  writer.writeLine(`resource ${resource.name} {`);
  writer.increaseIndent();

  if (resource.roles) {
    writer.writeLine(`roles = [${resource.roles.map(r => `"${r}"`).join(', ')}];`);
  }

  if (resource.permissions) {
    writer.writeLine(`permissions = [${resource.permissions.map(p => `"${p}"`).join(', ')}];`);
  }

  if (resource.relations && !isEmpty(resource.relations)) {
    const content = Object.entries(resource.relations)
      .map(([name, relation]) => `${name}: ${typeof relation === 'string' ? relation : relation.model}`)
      .join(', ');
    writer.writeLine(`relations = {${content}};`);
  }

  if (resource.rolePermissions) {
    for (const [role, permissions] of Object.entries(resource.rolePermissions)) {
      for (const permission of permissions) {
        writer.writeLine(`"${permission}" if "${role}";`);
      }
    }
  }

  if (resource.roleInherits) {
    for (const [role, inherits] of Object.entries(resource.roleInherits)) {
      const parts = role.split('@');
      const roleName = parts[0];
      const parentName = parts[1];
      for (const inherit of inherits) {
        let line = `"${inherit}" if "${roleName}"`;
        if (parentName) {
          line += ` on "${parentName}"`;
        }
        line += ';';
        writer.writeLine(line);
      }
    }
  }

  writer.decreaseIndent();
  writer.writeLine('}');

  // relations mapping
  if (resource.relations && !isEmpty(resource.relations)) {
    for (const [name, relation] of Object.entries(resource.relations)) {
      if (typeof relation === 'string' || !relation.property) {
        continue;
      }
      const modelVar = camelCaseName(relation.model);
      writer.writeLine(
        `has_relation(${modelVar}: ${relation.model}, "${name}", _: ${resource.name}{${relation.property}: ${modelVar}});`,
      );
    }
  }
}
