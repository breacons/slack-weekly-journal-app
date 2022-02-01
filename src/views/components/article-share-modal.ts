import { prisma } from '../../db';
import { Blocks, Md, Modal, Actions, Elements } from 'slack-block-builder';
import * as _ from 'lodash';
import { reactionOptions } from '../../constants/reactions';
import { VIEW_SHARE_ARTICLE } from '../../constants/views';
import { FIELDS_SELECTED_CONVERSATION } from '../../constants/fields';
import { ACTIONS_ARTICLE_SHARE_CHANGE } from '../../constants/actions';

interface Props {
  articleId: number;
}

export const articleSharesModal = async ({ articleId }: Props) => {
  // const article = await prisma.article.findUnique({
  //   where: {
  //     id: articleId,
  //   },
  // });

  return Modal({ title: 'Share article', callbackId: VIEW_SHARE_ARTICLE })
    .blocks(
      Blocks.Input({ label: 'Select user or channel' })
        .element(Elements.ConversationSelect().actionId(ACTIONS_ARTICLE_SHARE_CHANGE))
        .blockId(JSON.stringify({ field: FIELDS_SELECTED_CONVERSATION, articleId })),
      Blocks.Image({
        imageUrl: 'https://storage.googleapis.com/slack-digital-hq/share-article.jpg',
        altText: 'Call to action',
      }),
    )
    .submit('Share')
    .buildToObject();
};
