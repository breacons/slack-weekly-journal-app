import { Bits, Blocks, Elements, Input, Modal, setIfFalsy, setIfTruthy } from 'slack-block-builder';
import {
  ACTIONS_ADD_CATEGORY,
  ACTIONS_ARTICLE_SHARE_CHANGE,
  ACTIONS_REMOVE_CATEGORY,
  ACTIONS_SETTINGS_SUBMIT,
} from '../../constants/actions';
import { Journal, ArticleCategory } from '.prisma/client';
import { partition } from 'lodash';
import {
  FIELDS_JOURNAL_PUBLISH_DAY,
  FIELDS_JOURNAL_PUBLISH_TIME,
  FIELDS_JOURNAL_TITLE,
  FIELDS_PREFERENCES_WEEKLY_QUOTA,
  FIELDS_SELECTED_CONVERSATION,
} from '../../constants/fields';
import { Placeholder } from './placeholder';

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const settingsModal = ({ journal }: any) => {
  const [deletableCategory, nonDeletableCategory] = partition(
    journal.categories,
    (category) => category.deletable,
  );

  // TODO: handle empty state
  const modal = Modal({ title: 'Journal Settings', callbackId: ACTIONS_SETTINGS_SUBMIT })
    .blocks(
      Blocks.Header({ text: 'General' }),
      Blocks.Input({ label: 'Journal Title' })
        .element(Elements.TextInput().initialValue(journal.title).actionId(FIELDS_JOURNAL_TITLE))
        .blockId(FIELDS_JOURNAL_TITLE),
      Blocks.Input({ label: 'Notified channel' })
        .element(
          Elements.ChannelSelect()
            .actionId(FIELDS_SELECTED_CONVERSATION)
            // .initialChannel(journal.shareChannel || "") FIXME
            .placeholder('Where to share the new editions'),
        )
        .blockId(FIELDS_SELECTED_CONVERSATION),

      Blocks.Input({ label: 'Publishing Day' })
        .element(
          Elements.StaticSelect()
            .options(
              ...days.map((day, index) => Bits.Option({ value: index.toString(), text: day })),
            )
            .initialOption(
              Bits.Option({ value: journal.releaseDay.toString(), text: days[journal.releaseDay] }),
            )
            .actionId(FIELDS_JOURNAL_PUBLISH_DAY),
        )
        .blockId(FIELDS_JOURNAL_PUBLISH_DAY),
      Blocks.Input({ label: 'Publishing Time' })
        .element(
          Elements.TimePicker()
            .actionId(FIELDS_JOURNAL_PUBLISH_TIME)
            .initialTime(journal.releaseTime),
        )
        .blockId(FIELDS_JOURNAL_PUBLISH_TIME),
      Blocks.Input({ label: 'Weekly Quota' })
        .element(
          Elements.TextInput()
            .initialValue(journal.submissionQuota.toString())
            .actionId(FIELDS_PREFERENCES_WEEKLY_QUOTA),
        )
        .hint('Maximum submissions from an editor per week.')
        .blockId(FIELDS_PREFERENCES_WEEKLY_QUOTA),
      Placeholder(),
      Blocks.Divider(),
      Blocks.Header({ text: 'Topics' }),
      nonDeletableCategory.map((item: ArticleCategory) => Blocks.Section({ text: item.title })),
      deletableCategory.map((item: ArticleCategory) =>
        Blocks.Section({ text: item.title }).accessory(
          Elements.Button({ text: 'Delete' })
            .actionId(ACTIONS_REMOVE_CATEGORY)
            .value(item.id.toString()),
        ),
      ),
      Blocks.Input({ label: 'Add new topic' })
        .element(
          Elements.TextInput({ placeholder: 'Product Development' }).actionId(ACTIONS_ADD_CATEGORY),
        )
        .optional(true)
        .dispatchAction(true),
    )
    .submit('Save')
    .buildToObject();

  return modal;
};
