import { app } from '../../app';
import { prisma } from '../../db';
import { get } from 'lodash';
import { submissionDetailsModalFromMessage } from '../../views/components/submission-details-from-message';

export const handleFillSubmissionStart = async ({
  ack,
  say,
  context,
  body,
  payload,
  client,
  ...rest
}: any) => {
  await ack();

  const messageId = get(body, 'message.ts') || get(body, 'container.message_ts');
  const channelId = get(body, 'channel.id') || get(body, 'body.container.channel_id');

  const journal = await prisma.journal.findUnique({
    where: {
      workspaceId: context.journal.workspaceId,
    },
    include: {
      categories: true,
    },
  });

  const article = await prisma.article.findFirst({
    where: {
      url: { contains: payload.value },
    },
  });

  const modal = submissionDetailsModalFromMessage({
    journal,
    url: payload.value,
    message: { messageId, channelId },
    article
  });

  try {
    const result = await app.client.views.open({
      token: context.botToken,
      trigger_id: body.trigger_id,
      view: modal,
    });
  } catch (error) {
    console.error(error);
  }
};
