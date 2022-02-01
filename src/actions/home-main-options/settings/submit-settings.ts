import { transformFormValues } from '../../../utils/transform-form-values';
import { prisma } from '../../../db';
import {
  FIELDS_JOURNAL_PUBLISH_DAY,
  FIELDS_JOURNAL_PUBLISH_TIME,
  FIELDS_JOURNAL_TITLE,
  FIELDS_PREFERENCES_WEEKLY_QUOTA,
  FIELDS_SELECTED_CONVERSATION,
} from '../../../constants/fields';

export const submitSettings = async ({ payload, view, ack, context }) => {
  await ack();

  const values = transformFormValues(payload.state.values);

  await prisma.journal.update({
    where: {
      id: context.journal.id,
    },
    data: {
      title: values[FIELDS_JOURNAL_TITLE],
      releaseTime: values[FIELDS_JOURNAL_PUBLISH_TIME],
      releaseDay: parseInt(values[FIELDS_JOURNAL_PUBLISH_DAY], 10),
      shareChannel: values[FIELDS_SELECTED_CONVERSATION],
      submissionQuota: parseInt(values[FIELDS_PREFERENCES_WEEKLY_QUOTA], 10) || 5,
    },
  });
};
