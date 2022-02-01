import { ACTIONS_HOME_MAIN_OPTIONS, ACTIONS_SETTINGS_START } from '../constants/actions';
import { Bits, Blocks, Elements, HomeTab, Image } from 'slack-block-builder';

export const renderHomeEmptyJournal = async () => {
  return HomeTab()
    .blocks(
      Blocks.Section({ text: ` ` }).accessory(
        Elements.OverflowMenu()
          .options(Bits.Option({ text: 'Settings', value: ACTIONS_SETTINGS_START }))
          .actionId(ACTIONS_HOME_MAIN_OPTIONS),
      ),
      Image({
        imageUrl: 'https://storage.googleapis.com/slack-digital-hq/empty-edition.jpg',
        altText: 'Empty Edition',
        title: 'Hint: head over to the messages section where you can create a new submission!'
      }),
    )
    .buildToObject();
};
