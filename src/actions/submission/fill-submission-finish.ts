import { prisma } from '../../db';
import { transformFormValues } from '../../utils/transform-form-values';
import {
  FIELDS_SUBMISSION_CATEGORIES,
  FIELDS_SUBMISSION_RECOMMENDATION,
} from '../../constants/fields';
import { Blocks, Elements, Image, Md, Message } from 'slack-block-builder';
import { defaultLogo, defaultThumbnail } from '../../constants/placeholders';
import { reject as _reject } from 'lodash';
import * as dayjs from 'dayjs';
import * as _ from 'lodash';

export const handleFillSubmissionFinish = async ({
  ack,
  body,
  view,
  client,
  context,
  payload,
  ...rest
}: any) => {
  await ack();

  const { messageId, channelId, url } = JSON.parse(payload.callback_id);
  console.log('handleFillSubmissionFinish', { messageId, channelId });

  const values = transformFormValues(view.state.values);

  let article = await prisma.article.findUnique({
    where: {
      url: url,
    },
  });

  const submission = await prisma.submission.create({
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
    include: {
      categories: true,
    },
  });

  const text = `This story will be a part of the next *${context.journal.title}*!\nYou deserve this cake for educating our community: 🍰!`;

  try {
    await client.chat.update({
      text,
      ...Message()
        .channel(channelId)
        .ts(messageId)
        .text(text)
        .blocks(
          Blocks.Section({
            text,
          }),
          Blocks.Divider(),
          Blocks.Section({
            text: `*${Md.link(article.url, article.title || article.url)}* \n${
              article.description || ''
            }`,
          }).accessory(
            Image({
              imageUrl: article.image || defaultThumbnail,
              altText: article.title || 'Thumbnail',
            }),
          ),
        )
        .buildToObject(),
      channel: channelId,
      ts: messageId,
    });
  } catch (e) {
    console.error(JSON.stringify(e));
  }
};
