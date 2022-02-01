import { prisma } from '../../../db';
import * as _ from 'lodash';
import { rewardsModal } from '../../../views/components/rewards-modal';
import { app } from '../../../app';

export const startRewards = async ({ context, body }: any) => {
  const submissions = await prisma.submission.findMany({
    where: {
      userId: context.user.id,
      journalId: context.journal.id,
    },
    include: {
      article: {
        include: {
          reactions: true,
        },
      },
    },
  });

  const reactions = _.groupBy(
    _.flatten(_.map(submissions, (submission) => submission.article.reactions)),
    'reaction',
  );

  const modal = rewardsModal({ reactions: Object.values(reactions) });
  await app.client.views.open({
    token: context.botToken,
    trigger_id: body.trigger_id,
    view: modal,
  });
};
