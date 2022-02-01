import { transformFormValues } from '../../../utils/transform-form-values';
import { prisma } from '../../../db';
import {
  FIELDS_JOURNAL_PUBLISH_DAY,
  FIELDS_JOURNAL_PUBLISH_TIME,
  FIELDS_JOURNAL_TITLE,
  FIELDS_PREFERENCES_HIDDEN_TOPICS,
  FIELDS_SELECTED_CONVERSATION,
} from '../../../constants/fields';

export const submitPreferences = async ({ payload, view, ack, context }) => {
  await ack();

  const values = transformFormValues(payload.state.values);
  const hiddenTopics = values[FIELDS_PREFERENCES_HIDDEN_TOPICS];

  await prisma.user.update({
    where: {
      id: context.user.id,
    },
    data: {
      hiddenCategories: { set: hiddenTopics }
    },
  });

  // await prisma.user.update({
  //   where: {
  //     id: context.user.id,
  //   },
  //   data: {
  //     hiddenCategories: { connect: hiddenTopics }
  //   },
  // });
};
