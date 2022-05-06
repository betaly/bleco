import {TextWriter} from '@obcode/templating';
import isEmpty from 'tily/is/empty';
import camelCaseName from 'tily/string/camelCaseName';
import {PolarResource} from './types';

export function generateResourceScripts(writer: TextWriter, resource: PolarResource) {
  generateResourceBlockScripts(writer, resource);
  generateHasRelationScripts(writer, resource);
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
    writer.writeLine(`relations = {`);
    writer.increaseIndent();
    Object.keys(resource.relations).forEach((name, i, arr) => {
      const relation = resource.relations![name];
      let line = `${name}: ${relation.model}`;
      if (i < arr.length - 1) {
        line += ',';
      }
      writer.writeLine(line);
    });
    writer.decreaseIndent();
    writer.writeLine('};');
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
}

export function generateHasRelationScripts(writer: TextWriter, resource: PolarResource) {
  if (resource.relations && !isEmpty(resource.relations)) {
    for (const [name, relation] of Object.entries(resource.relations)) {
      const modelVar = camelCaseName(relation.model);
      writer.writeLine(
        `has_relation(${modelVar}: ${relation.model}, "${name}", _: ${resource.name}{${relation.property}: ${modelVar}});`,
      );
    }
  }
}
