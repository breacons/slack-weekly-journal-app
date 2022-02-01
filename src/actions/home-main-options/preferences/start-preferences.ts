import { prisma } from '../../../db';
import { settingsModal } from '../../../views/components/settings-modal';
import { preferencesModal } from '../../../views/components/preferences-modal';

export const startPreferences = async ({ client, body, context }: any) => {
  const categories = await prisma.articleCategory.findMany({
    where: {
      journalId: context.journal.id,
      deleted: false,
    },
    include: {
      users: {
        where: {
          id: context.user.id,
        },
      },
    },
  });

  const modal = preferencesModal({ categories });
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
