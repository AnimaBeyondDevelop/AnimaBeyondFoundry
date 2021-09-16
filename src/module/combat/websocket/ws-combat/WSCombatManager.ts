import { ABFDialogs } from '../../../dialogs/ABFDialogs';

export abstract class WSCombatManager<M, N> {
  protected constructor(protected game: Game) {
    game.socket?.on('system.animabf', msg => this.receive(msg));
  }

  protected emit(msg: M) {
    this.game.socket?.emit('system.animabf', msg);
  }

  protected findTokenById(tokenId: string): TokenDocument {
    const token = this.game.scenes
      ?.find(scene => !!scene.tokens.find(u => u?.id === tokenId))
      ?.tokens.find(u => u?.id === tokenId);

    if (!token) {
      const message = this.game.i18n.format('macros.combat.dialog.error.noExistTokenAnymore.title', {
        token: tokenId
      });
      ABFDialogs.prompt(message);
      throw new Error(message);
    }

    if (!token.actor) {
      const message = this.game.i18n.format('macros.combat.dialog.error.noActorAssociatedToToken.title', {
        token: tokenId
      });
      ABFDialogs.prompt(message);
      throw new Error(message);
    }

    return token;
  }

  abstract receive(msg: N);
}
