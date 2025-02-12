// TODO: remove this file once sockets are updated, since it is not used anymore
export class SvelteAttackDialog extends Application {
  constructor(attacker, defender, hook, bonus) {
    super();
    this.data = { attacker, defender, hook, bonus };
    this.render(true);
  }
}

