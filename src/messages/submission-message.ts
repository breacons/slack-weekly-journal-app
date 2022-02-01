import { ACTIONS_FILL_SUBMISSION_START } from '../constants/actions';
import { fetchMetadataForUrl } from '../utils/metascraper';
import { prisma } from '../db';
import { Blocks, Elements, Message } from 'slack-block-builder';

export const handleSubmissionMessage = async ({ message, context, say, client }: any) => {
  const url = context.matches[0].split('|')[0].split('>')[0];
  const metaData = await fetchMetadataForUrl(url);

  let article = await prisma.article.findFirst({
    where: {
      url: { contains: metaData.url },
    },
    include: {
      submissions: {
        where: {
          journalId: context.journal.id,
          editionId: {
            gte: -1,
          },
        },
        include: {
          edition: true,
        },
      },
    },
  });

  const userSubmissionsCount = await prisma.submission.count({
    where: {
      userId: context.user.id,
      journalId: context.journal.id,
      editionId: null,
    },
  });

  if (article) {
    if (article.submissions && article.submissions.length > 0) {
      console.log(JSON.stringify(article));
      await say({
        text: `You found a great article, but somebody already published this in *Edition #${
          article.submissions[0].edition ? article.submissions[0].edition.number : 12 // FIXME
        }*. 👋`,
      });
      return;
    }
  } else {
    article = await prisma.article.create({
      data: {
        url: metaData.url,
        author: metaData.author,
        date: metaData.date,
        description: metaData.description,
        image: metaData.image,
        logo:
          metaData.logo && metaData.logo.includes('medium.com')
            ? 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Medium_logo_Monogram.svg/195px-Medium_logo_Monogram.svg.png'
            : metaData.logo,
        title: metaData.title || metaData.url,
        publisher: metaData.publisher,
      },
    });
  }

  // TODO: randomise messages
  const createResponse = (text, buttonText) =>
    Message()
      .ephemeral()
      .blocks(
        Blocks.Section({
          text,
        }),
        Blocks.Actions().elements(
          Elements.Button({ text: buttonText })
            .value(metaData.url)
            .actionId(ACTIONS_FILL_SUBMISSION_START),
        ),
      )
      .buildToObject();

  if (userSubmissionsCount >= context.journal.submisssionQuota) {
    const text = `Looks like you already submitted the maximum amount of ${context.journal.submisssionQuota} articles to the next edition. To maintain the high quality of _${context.journal.title}_, please only submit your best picks! 🙌`;
    const buttonText = `Submit anyway`;

    const response = createResponse(text, buttonText);
    await client.chat.postMessage({
      ...response,
      text,
      channel: message.channel,
      user: context.user.id,
    });
  } else {
    const text = `Oh wow, what a nice found! 😯\nPlease add some extra details, so we can share this article in the next edition!`;
    const buttonText = `Finalise submission`;
    const response = createResponse(text, buttonText);

    await client.chat.postMessage({
      ...response,
      text,
      channel: message.channel,
      user: context.user.id,
    });
  }
};
