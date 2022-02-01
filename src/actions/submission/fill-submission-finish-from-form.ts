import { prisma } from '../../db';
import { transformFormValues } from '../../utils/transform-form-values';
import {
  FIELDS_SUBMISSION_CATEGORIES,
  FIELDS_SUBMISSION_RECOMMENDATION,
  FIELDS_SUBMISSION_URL,
} from '../../constants/fields';
import { fetchMetadataForUrl } from '../../utils/metascraper';
import { Blocks, Image, Md, Message, Section } from 'slack-block-builder';
import { defaultThumbnail } from '../../constants/placeholders';

export const handleFillFormSubmissionFinish = async ({
  ack,
  body,
  view,
  client,
  context,
  payload,
  ...rest
}: any) => {
  await ack();

  const { messageId, channelId } = JSON.parse(payload.callback_id);
  const values = transformFormValues(view.state.values);

  let metaData;
  try {
    metaData = await fetchMetadataForUrl(values[FIELDS_SUBMISSION_URL]);
  } catch (e) {
    await client.chat.postMessage({
      channel: channelId,
      text: `Woopsie. We couldn't process your submission due to an unknown reason. 😱 `,
      blocks: [],
    });
    return;
  }

  let article = await prisma.article.findFirst({
    where: {
      url: { contains: metaData.url },
    },
  });

  if (!article) {
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

  await prisma.submission.create({
    data: {
      journal: { connect: { id: context.journal.id } },
      article: { connect: { id: article.id } },
      user: { connect: { id: context.user.id } },
      recommendation: values[FIELDS_SUBMISSION_RECOMMENDATION],
      categories: {
        connect: values[FIELDS_SUBMISSION_CATEGORIES],
      },
      edition: undefined,
    },
  });

  const text = `This story will be a part of the next *${context.journal.title}*!\nYou deserve this cake for educating our community: 🍰!`;

  try {
    await client.chat.postMessage({
      ...Message()
        .channel(channelId || context.user.id)
        .ts(messageId)
        .text(text)
        .blocks(
          Blocks.Section({
            text,
          }),
          Blocks.Divider(),
          Blocks.Section({
            text: `*${article.title || article.url}* \n${article.description || ''}`,
          }).accessory(
            Image({
              imageUrl: article.image || defaultThumbnail,
              altText: article.title || 'Thumbnail',
            }),
          ),
        )
        .buildToObject(),
    });
  } catch (e) {
    console.error(JSON.stringify(e));
  }
};
