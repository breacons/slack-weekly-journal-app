import { ALL_CATEGORIES } from '../../constants/options';
import { prisma } from '../../db';
import { renderHomeJournalEdition } from '../../views/render-home-journal-edition';

// refactor this to a common home tab component
export const filterByCategory = async ({ context, payload, client, body }: any) => {
  let editionId = null;
  let categoryId = null;
  let selectedCategory = null;
  let page = 1;
  if (!payload.selected_option) {
  } else {
    const { category, edition, currentPage } = JSON.parse(payload.selected_option.value);
    page = currentPage;

    if (category !== ALL_CATEGORIES) {
      categoryId = parseInt(category, 10);

      selectedCategory = await prisma.articleCategory.findUnique({
        where: {
          id: categoryId,
        },
      });
    }

    editionId = parseInt(edition, 10);
  }

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

  let resultView = await renderHomeJournalEdition({
    journal: context.journal,
    edition,
    selectedCategory,
    currentEditionId: currentEdition.id,
    currentPage: page,
    context,
  });

  await client.views.update({
    token: context.botToken,
    user_id: body.user.id,
    view_id: (body as any).view.id,
    view: resultView,
  });
};
