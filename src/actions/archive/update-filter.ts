import * as dayjs from 'dayjs';
import { prisma } from '../../db';
import { archiveModal } from '../../views/components/archive-modal';

// TODO: refactor to avoid duplications
export const updateArchiveFilter = async ({ client, context, body, year, month }: any) => {
  const start = dayjs()
    .year(year)
    .month(month - 1)
    .startOf('month');
  const end = start.add(1, 'month').startOf('month');

  const editions = await prisma.edition.findMany({
    where: {
      journalId: context.journal.id,
      releaseDate: {
        gte: start.toISOString(),
        lt: end.toISOString(),
      },
      current: false,
    },
    orderBy: [
      {
        releaseDate: 'desc',
      },
    ],
    include: {
      _count: {
        select: {
          submissions: true,
        },
      },
    },
  });

  const modal = archiveModal({
    year: year.toString(),
    month: month.toString(),
    editions,
  });

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
