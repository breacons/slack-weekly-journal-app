import { app } from '../../app';
import { archiveModal } from '../../views/components/archive-modal';
import * as dayjs from 'dayjs';
import { prisma } from '../../db';

export const openArchive = async ({ context, body, ack }) => {
  await ack();

  const year = dayjs().year();
  const month = dayjs().month() + 1;

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
    await app.client.views.open({
      token: context.botToken,
      // Pass a valid trigger_id within 3 seconds of receiving it
      trigger_id: body.trigger_id,
      // View payload
      view: modal,
    });
  } catch (error) {
    console.error(JSON.stringify(error));
  }
};
