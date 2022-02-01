import { prisma } from '../db';
import { flatten as _flatten, groupBy as _groupBy } from 'lodash';
import { editionHomeTab } from './edition';
import { Article } from '.prisma/client';

export const renderHomeJournalEdition = async ({
  journal,
  edition,
  selectedCategory,
  currentEditionId,
  context,
  currentPage = 1,
}: any) => {
  let includedCategories = undefined;
  if (selectedCategory) {
    includedCategories = {
      some: {
        id: selectedCategory.id,
      },
    };
  } else if (context.user.hiddenCategories && context.user.hiddenCategories.length > 0) {
    includedCategories = {
      every: {
        id: { notIn: context.user.hiddenCategories.map((c) => c.id) },
      },
    };
  }

  const submissions = await prisma.submission.findMany({
    where: {
      journalId: journal.id,
      editionId: edition.id,
      categories: includedCategories,
    },
    include: {
      article: {
        include: {
          reactions: {
            where: {
              journalId: journal.id,
            },
          },
        },
      },
      categories: true,
    },
  });

  const { categories } = await prisma.journal.findUnique({
    where: {
      id: journal.id,
    },
    include: {
      categories: {
        where: {
          deleted: false,
        },
      },
    },
  });

  if (submissions) {
    const groupedSubmissions = _groupBy(submissions, 'articleId');

    const articles = Object.values(groupedSubmissions).map((group) => {
      const allReactions = group[0].article.reactions;
      const reactions = Object.entries(_groupBy(allReactions, 'reaction')).map(
        ([reaction, reactions]) => {
          return {
            reaction,
            count: reactions.length,
            checked: !!reactions.find((r) => r.userId === context.user.id),
          };
        },
      );

      return {
        article: group[0].article as Article,
        submissions: group.map((submission) => ({
          userId: submission.userId,
          recommendation: submission.recommendation,
          category: submission.categories,
        })),
        categories: _flatten(group.map((submission) => submission.categories)),
        reactions,
      };
    }) as any;

    return editionHomeTab({
      articles,
      categories,
      selectedCategory,
      currentEditionId,
      edition,
      currentPage,
      hiddenCategories: context.user.hiddenCategories,
    });
  }
};
