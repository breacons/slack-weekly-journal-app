import { WithMiddleware } from '../../../interface';
import { SlackAction, SlackActionMiddlewareArgs } from '@slack/bolt/dist/types';
import { BlockAction } from '@slack/bolt';
import { prisma } from '../../../db';
import { settingsModal } from '../../../views/components/settings-modal';

export const addArticleCategory = async ({
  body,
  client,
  payload,
  context,
  ack,
  ...rest
}: WithMiddleware<SlackActionMiddlewareArgs<SlackAction>>) => {
  const teamId = body.team.id;

  await ack()

  // TODO: check for same name
  await prisma.articleCategory.create({
    data: {
      journalId: context.journal.id,
      title: (payload as any).value,
      deletable: true
    },
  });

  // TODO: this could be optimised
  const journal = await prisma.journal.findUnique({
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
  await client.views.update({
    token: context.botToken,
    user_id: body.user.id,
    view_id: (body as any).view.id,
    view: modal,
  });
};
