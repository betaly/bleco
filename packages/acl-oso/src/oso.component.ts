import {
  Application,
  BindingScope,
  Component,
  ContextTags,
  CoreBindings,
  CoreTags,
  createBindingFromClass,
  inject,
  injectable
} from "@loopback/core";
import { Enforcer } from "./enforcer";
import { OsoBindings } from "./keys";
import { OsoAliaser } from "./alias";
import { OsoPolicy } from "./types";
import { OsoPolicyBuilder } from "./builder";
import isEmpty from "tily/is/empty";
import { EntityClass } from "@bleco/query";

@injectable({ tags: { [ContextTags.KEY]: OsoBindings.COMPONENT.key } })
export class OsoComponent implements Component {
  bindings = [createBindingFromClass(Enforcer, { key: OsoBindings.ENFORCER, defaultScope: BindingScope.SINGLETON })];

  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    readonly app: Application
  ) {
    OsoAliaser.alias(app);

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    app.once("booted", () => this.setup());
  }

  async setup() {
    const builder = new OsoPolicyBuilder();
    const classes: Record<string, EntityClass> = {};
    const bindings = this.app.findByTag(CoreTags.COMPONENT);
    for (const b of bindings) {
      const component = await this.app.get<Component>(b.key);
      if (!component.oso) {
        continue;
      }

      const osoClasses = component.osoClasses as EntityClass[];
      if (osoClasses) {
        osoClasses.forEach(cls => (classes[cls.name] = cls));
      }

      const policy = component.osoPolicy as OsoPolicy;

      if (policy.actors) {
        builder.addActors(policy.actors);
      }
      if (policy.resources) {
        builder.addResources(policy.resources);
      }
      if (policy.rules) {
        builder.addRules(policy.rules);
      }
    }

    const enforcer = await this.app.get(OsoBindings.ENFORCER);

    // register oso classes
    if (!isEmpty(classes)) {
      for (const name in classes) {
        enforcer.addModel(classes[name]);
      }
    }

    // load policy script
    const content = await builder.build();
    if (!isEmpty(content)) {
      await enforcer.loadStr(content);
    }

    // bind policy to context
    this.app.bind(OsoBindings.POLICY).to(builder.policy);
  }
}
