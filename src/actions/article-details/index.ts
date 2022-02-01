import {
  ACTIONS_ARTICLE_REVIEWS_START,
  ACTIONS_ARTICLE_SHARE_START,
} from '../../constants/actions';
import { app } from '../../app';
import { articleReviewsModal } from '../../views/components/article-reviews-modal';
import { articleSharesModal } from '../../views/components/article-share-modal';

export const articleDetails = async ({ payload, body, view, context, ack }: any) => {
  await ack()
  const values = JSON.parse(payload.selected_option.value);
  const articleId = parseInt(values.articleId, 10);

  let modal = null;

  if (values.actionId === ACTIONS_ARTICLE_SHARE_START) {
    modal = await articleSharesModal({ articleId });
  } else if (values.actionId === ACTIONS_ARTICLE_REVIEWS_START) {
    modal = await articleReviewsModal({ articleId, journalId: context.journal.id });
  }

  try {
    await app.client.views.open({
      token: context.botToken,
      trigger_id: body.trigger_id,
      view: modal,
    });
  } catch (error) {
    console.error(JSON.stringify(error));
  }
};
