import { prisma } from '../../db';
import { searchModal } from '../../views/components/search-modal';

export const handleSearch = async ({ searchPhrase, context, page, client, body }) => {
  const articles = await prisma.article.findMany({
    where: {
      OR: [
        {
          title: { contains: searchPhrase },
          submissions: { some: { journalId: context.journal.id, editionId: { gte: -1 } } },
        },
        {
          description: { contains: searchPhrase },
          submissions: { some: { journalId: context.journal.id, editionId: { gte: -1 } } },
        },
      ],
    },
    include: {
      submissions: {
        include: {
          edition: true,
        },
      },
    },
  });

  const modal = searchModal({ results: articles, searchPhrase, page });

  try {
    await client.views.update({
      token: context.botToken,
      user_id: body.user.id,
      view_id: (body as any).view.id,
      view: modal,
    });
  } catch (error) {
    console.error(JSON.stringify(error));
  }
};
