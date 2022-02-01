import {
  ACTIONS_REACT_ON_ARTICLE,
  ACTIONS_REACT_ON_ARTICLE_ADD,
  ACTIONS_REACT_ON_ARTICLE_REMOVE,
} from '../../constants/actions';
import { prisma } from '../../db';
import { renderHomeJournalEdition } from '../../views/render-home-journal-edition';

export const reactToArticle = async ({ client, context, payload, ack, body }: any) => {
  await ack();
  const { articleId, categoryId, reaction, method, editionId, currentPage } = JSON.parse(payload.action_id);

  if (method === ACTIONS_REACT_ON_ARTICLE_ADD) {
    await prisma.articleReaction.create({
      data: {
        userId: context.user.id,
        articleId,
        reaction,
        journalId: context.journal.id,
      },
    });
  } else {
    await prisma.articleReaction.deleteMany({
      where: {
        userId: context.user.id,
        articleId,
        reaction,
        journalId: context.journal.id,
      },
    });
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

  const selectedCategory = categoryId
    ? await prisma.articleCategory.findUnique({
        where: {
          id: categoryId,
        },
      })
    : null;

  const view = await renderHomeJournalEdition({
    journal: context.journal,
    edition,
    currentEditionId: currentEdition.id,
    selectedCategory,
    context,
    currentPage
  });

  try {
    /* view.publish is the method that your app uses to push a view to the Home tab */
    await client.views.publish({
      user_id: context.user.id,
      view,
    });
  } catch (error) {
    console.error(JSON.stringify(error));
  }

  //
  // let resultView = await renderHomeJournalEdition({
  //   journal: context.journal,
  //   edition,
  //   selectedCategory,
  //   currentEditionId: currentEdition.id,
  // });

  // article, reaction, method (add, remove)
  // edition, category
};
