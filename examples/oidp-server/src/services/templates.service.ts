import {BindingScope, CoreBindings, inject, injectable} from '@loopback/core';
import ejs from 'ejs';
import * as fs from 'fs';
import path from 'path';

@injectable({scope: BindingScope.SINGLETON})
export class TemplatesService {
  private templateFns: Record<string, ejs.TemplateFunction> = {};

  constructor(
    @inject(CoreBindings.APPLICATION_CONFIG.deepProperty('viewsPath'), {optional: true})
    protected viewsPath = path.resolve(__dirname, '../../views'),
  ) {}

  renderWithLayout(viewFile: string, data: ejs.Data) {
    const dir = path.dirname(viewFile);
    return this.render(path.join(dir, '_layout.ejs'), {
      ...data,
      body: this.render(viewFile, data),
    });
  }

  render(viewFile: string, data: ejs.Data) {
    const file = path.resolve(this.viewsPath, viewFile);
    let templateFn = this.templateFns[file];
    if (!templateFn) {
      const template = fs.readFileSync(file, 'utf-8');
      templateFn = this.templateFns[file] = ejs.compile(template);
    }
    return templateFn(data);
  }
}
