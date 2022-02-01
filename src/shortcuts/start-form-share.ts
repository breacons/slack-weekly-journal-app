import { submissionDetailsModalFromForm } from '../views/components/submission-details-from-form';
import { prisma } from '../db';
import { app } from '../app';

export const startFormShare = async ({ ack, context, body, payload, ...rest }) => {
  await ack();

  const journal = await prisma.journal.findUnique({
    where: {
      workspaceId: context.journal.workspaceId,
    },
    include: {
      categories: true,
    },
  });

  const modal = submissionDetailsModalFromForm({
    journal,
    message: { channelId: body.channel_id },
  });

  try {
    await app.client.views.open({
      token: context.botToken,
      trigger_id: body.trigger_id,
      view: modal,
    });
  } catch (error) {
    console.error(error);
  }
};
