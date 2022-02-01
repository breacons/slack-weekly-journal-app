import { WithMiddleware } from '../../../interface';
import { SlackAction, SlackActionMiddlewareArgs } from '@slack/bolt/dist/types';
import { BlockAction } from '@slack/bolt';
import { prisma } from '../../../db';
import { settingsModal } from '../../../views/components/settings-modal';

export const removeArticleCategory = async ({
  body,
  client,
  payload,
  context,
  ack,
  ...rest
}: WithMiddleware<SlackActionMiddlewareArgs<SlackAction>>) => {
  const teamId = body.team.id;

  await ack();

  // TODO: this should be a middleware?
  let journal = await prisma.journal.findUnique({
    where: {
      workspaceId: teamId,
    },
  });

  await prisma.articleCategory.update({
    where: {
      id: parseInt((payload as any).value, 10),
    },
    data: {
      deleted: true
    }
  });

  // TODO: this could be optimised
  journal = await prisma.journal.findUnique({
    where: {
      workspaceId: teamId,
    },
    include: {
      categories: {
        where: {
          deleted: false,
        },
      },
    },
  });

  const modal = settingsModal({ journal });
  const result = await client.views.update({
    // token: context.botToken,
    // Pass the view_id
    user_id: body.user.id,
    view_id: (body as any).view.id,
    // View payload with updated blocks
    view: modal,
  });
};
