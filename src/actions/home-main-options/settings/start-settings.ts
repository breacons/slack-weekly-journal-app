import { prisma } from '../../../db';
import { settingsModal } from '../../../views/components/settings-modal';

export const startSettings = async ({ client, body, context }: any) => {
  const journal = await prisma.journal.findUnique({
    where: {
      workspaceId: context.journal.workspaceId,
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

  try {
    await client.views.open({
      token: context.botToken,
      trigger_id: body.trigger_id,
      view: modal,
    });
  } catch (error) {
    console.error(JSON.stringify(error));
  }
};
