import { prisma } from '../db';
import { renderHomeEmptyJournal } from '../views/render-home-empty-journal';
import { renderHomeJournalEdition } from '../views/render-home-journal-edition';

export const renderHomeTab = async ({ client, context, editionId = null }: any) => {
  let edition;

  const currentEdition = await prisma.edition.findFirst({
    where: {
      journalId: context.journal.id,
      current: true,
    },
  });

  if (editionId) {
    edition = await prisma.edition.findUnique({
      where: {
        id: editionId,
      },
    });
  } else {
    edition = currentEdition;
  }

  let homeTab = null;

  if (!edition) {
    homeTab = await renderHomeEmptyJournal();
  } else {
    homeTab = await renderHomeJournalEdition({
      journal: context.journal,
      edition,
      currentEditionId: currentEdition.id,
      context,
    });
  }

  try {
    await client.views.publish({
      user_id: context.user.id,
      view: homeTab,
    });
  } catch (error) {
    console.error(JSON.stringify(error));
  }
};
