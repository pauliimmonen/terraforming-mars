import {expect} from 'chai';
import {Aurorai} from '../../../src/cards/pathfinders/Aurorai';
import {Game} from '../../../src/Game';
import {TestPlayer} from '../../TestPlayer';
import {getTestPlayer, newTestGame} from '../../TestGame';
import {cast, runAllActions} from '../../TestingUtils';
import {GreeneryStandardProject} from '../../../src/cards/base/standardProjects/GreeneryStandardProject';
import {AsteroidStandardProject} from '../../../src/cards/base/standardProjects/AsteroidStandardProject';
import {SelectHowToPay} from '../../../src/inputs/SelectHowToPay';
import {HowToPay} from '../../../src/common/inputs/HowToPay';

describe('Aurorai', function() {
  let card: Aurorai;
  let player: TestPlayer;
  let game: Game;

  beforeEach(function() {
    card = new Aurorai();
    game = newTestGame(1);
    player = getTestPlayer(game, 0);
    player.setCorporationForTest(card);
  });

  it('on TR bump', () => {
    expect(card.resourceCount).eq(0);
    player.increaseTerraformRating();
    runAllActions(game);
    expect(card.resourceCount).eq(1);

    player.increaseTerraformRatingSteps(3);
    runAllActions(game);
    expect(card.resourceCount).eq(4);
  });

  it('greenery standard project', () => {
    const greenery = new GreeneryStandardProject();
    expect(greenery.canAct(player)).is.false;

    player.megaCredits = 23;
    expect(greenery.canAct(player)).is.true;

    player.megaCredits = 20;
    expect(greenery.canAct(player)).is.false;

    card.resourceCount++;
    expect(greenery.canAct(player)).is.true;
  });

  it('paying for asteroid standard project', () => {
    const asteroid = new AsteroidStandardProject();
    expect(asteroid.canAct(player)).is.false;

    player.megaCredits = 10;
    card.resourceCount = 1;
    expect(asteroid.canAct(player)).is.false;

    card.resourceCount = 3;
    expect(asteroid.canAct(player)).is.true;

    const playerInput = asteroid.action(player);
    expect(playerInput).is.undefined;
    runAllActions(game);

    const selectHowToPay = cast(player.popWaitingFor(), SelectHowToPay);
    expect(selectHowToPay.canUseData).is.true;

    expect(game.getTemperature()).eq(-30);
    selectHowToPay.cb({...HowToPay.EMPTY, megaCredits: 8, data: 2});
    expect(game.getTemperature()).eq(-28);
    expect(player.megaCredits).eq(2);
    expect(player.getSpendableData()).eq(1);
  });
});
