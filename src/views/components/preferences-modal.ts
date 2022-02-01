import { Bits, Blocks, Elements, Modal } from 'slack-block-builder';
import { ACTIONS_PREFERENCES_SUBMIT } from '../../constants/actions';
import { FIELDS_PREFERENCES_HIDDEN_TOPICS } from '../../constants/fields';

// TODO: notification settings?
export const preferencesModal = ({ categories }: any) => {
  // TODO: handle empty state
  const modal = Modal({ title: 'Membership Preferences', callbackId: ACTIONS_PREFERENCES_SUBMIT })
    .blocks(
      Blocks.Input({
        label: 'Hidden Topics',
        hint: 'Articles in these topics will not appear in your journal by default',
      })
        .optional(true)
        .element(
          Elements.Checkboxes()
            .options(
              ...categories.map((category) =>
                Bits.Option({
                  text: category.title,
                  value: category.id.toString(),
                  // description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
                }),
              ),
            )
            .initialOptions(
              categories
                .filter((category) => category.users && category.users.length > 0)
                .map((category) =>
                  Bits.Option({
                    text: category.title,
                    value: category.id.toString(),
                    // description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
                  }),
                ),
            )
            .actionId(FIELDS_PREFERENCES_HIDDEN_TOPICS),
        )
        .blockId(FIELDS_PREFERENCES_HIDDEN_TOPICS),
    )
    .submit('Save')
    .buildToObject();

  return modal;
};
