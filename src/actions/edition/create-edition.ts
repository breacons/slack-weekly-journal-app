import { prisma } from '../../db';
import { Journal } from '.prisma/client';
import { createCover, createThumbnail } from '../../utils/create-image';
import { uploadFile } from '../../utils/upload';
import * as _ from 'lodash';
import { Blocks, Elements, Image, Md, Message } from 'slack-block-builder';

export const createEdition = async ({ context, date, ack, client }: any) => {
  console.log('Creating new edition');

  await ack();
  const journal: Journal = context.journal;

  const newSubmission = await prisma.submission.findFirst({
    where: {
      journalId: journal.id,
      editionId: null,
    },
  });

  if (newSubmission) {
    const lastEdition = await prisma.edition.findFirst({
      where: {
        journalId: journal.id,
        current: true,
      },
    });

    if (lastEdition) {
      await prisma.edition.update({
        where: {
          id: lastEdition.id,
        },
        data: {
          current: false,
        },
      });
    }

    const editionNumber = lastEdition ? lastEdition.number + 1 : 1;

    const currenEdition = await prisma.edition.create({
      data: {
        journalId: journal.id,
        current: true,
        releaseDate: date || new Date(),
        number: editionNumber,
      },
    });

    await prisma.submission.updateMany({
      where: {
        journalId: journal.id,
        editionId: null,
      },
      data: {
        editionId: currenEdition.id,
      },
    });

    const editionSubmissions = await prisma.submission.findMany({
      where: {
        journalId: journal.id,
        editionId: currenEdition.id,
      },
      include: {
        article: true,
        categories: true,
      },
    });

    const articleIds = editionSubmissions.map((submission) => submission.articleId);
    const userIds = editionSubmissions.map((submission) => submission.userId);
    const categoryIds = _.flatten(
      editionSubmissions.map((submission) =>
        _.map(submission.categories, (category) => category.id),
      ),
    );

    const articleWithImage = editionSubmissions.find(
      (submission) => submission.article.image !== null,
    );

    try {
      const coverBuffer = await createCover({
        imageUrl: articleWithImage ? articleWithImage.article.image : null,
        editionNumber: editionNumber,
        date: currenEdition.releaseDate,
        journalName: journal.title,
        editorNumber: _.uniq(userIds).length,
        articleNumber: _.uniq(articleIds).length,
        topicNumber: _.uniq(categoryIds).length,
      });

      const coverLink = await uploadFile({
        buffer: coverBuffer,
        fileName: `covers/${journal.id}-${editionNumber}.png`,
      });

      const thumbnailBuffer = await createThumbnail({ editionNumber: editionNumber });
      const thumbnailLink = await uploadFile({
        buffer: thumbnailBuffer,
        fileName: `thumbnails/${journal.id}-${editionNumber}.png`,
      });

      await prisma.edition.update({
        where: {
          id: currenEdition.id,
        },
        data: {
          coverImage: coverLink,
          thumbnailImage: thumbnailLink,
        },
      });

      // TODO: ranodmise message
      const appLink = `slack://app?team=${journal.workspaceId}&id=${process.env.SLACK_APP_ID}`;
      await client.chat.postMessage({
        channel: context.journal.shareChannel,
        ...Message()
          .blocks(
            Blocks.Image({ imageUrl: coverLink, altText: 'Cover' }),
            Blocks.Section({
              text: `*${Md.link(
                appLink,
                `We just published the fresh #${editionNumber} ${journal.title}! 🎉`,
              )}*\nWith ${
                _.uniq(articleIds).length
              } submitted stories, we are bringing you truly exciting content from all around our community. There is no time to waste, check it out now! 😉`,
            }),
            Blocks.Actions().elements(Elements.Button({ text: 'Start reading', url: appLink })), // TODO: can we deeplink this? Couldn't find documentation about it.
          )
          .text({
            text: `*We just published the fresh #${editionNumber} ${journal.title}! 🎉*\nWith ${
              _.uniq(articleIds).length
            } submitted stories, we are bringing you truly exciting content from all around our community. There is no time to waste, check it out now! 😉`,
          })
          .buildToObject(),
      });
    } catch (e) {
      console.error(e);
    }
  }
};
