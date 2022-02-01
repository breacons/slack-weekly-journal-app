import { prisma } from '../../db';
import { Blocks, Md, Modal } from 'slack-block-builder';
import * as _ from 'lodash';
import { reactionOptions } from '../../constants/reactions';

interface Props {
  articleId: number;
  journalId: number;
}

export const articleReviewsModal = async ({ articleId, journalId }: Props) => {
  const article = await prisma.article.findUnique({
    where: {
      id: articleId,
    },
    include: {
      reactions: true,
      submissions: {
        where: {
          journalId,
        },
      },
    },
  });

  const reactions = _.groupBy(article.reactions, 'reaction');

  return Modal({ title: 'Reviews & Reactions' })
    .blocks(
      Blocks.Header({ text: 'Reviews' }),
      Blocks.Section({
        text: article.submissions
          .map(
            (submission) =>
              `_${Md.user(submission.userId)}:_\n_${Md.blockquote(submission.recommendation)}_`,
          )
          .join('\n\n'),
      }),
      Blocks.Header({ text: 'Reactions' }),
      ...Object.entries(reactions).map(([reaction, entities]) => [
        Blocks.Section({
          text: `${reactionOptions.find((r) => r.value === reaction).emoji}\n${entities
            .map((e) => Md.user(e.userId))
            .join(' ')}`,
        }),
      ]),
    )
    .buildToObject();
};
