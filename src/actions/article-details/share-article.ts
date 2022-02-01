import { ACTIONS_ARTICLE_SHARE_CHANGE } from '../../constants/actions';
import { prisma } from '../../db';

export const handleShareArticle = async ({
  ack,
  payload,
  context,
  client,
}: any) => {
  await ack();

  const [key, value] = Object.entries(payload.state.values)[0];
  const { articleId } = JSON.parse(key);
  const conversationId = value[ACTIONS_ARTICLE_SHARE_CHANGE].selected_conversation;

  const article = await prisma.article.findUnique({
    where: {
      id: articleId,
    },
  });

  const result = await client.chat.postMessage({
    channel: conversationId,
    as_user: true,
    text: `👀 I found this exciting article in our _${context.journal.title}_: \n <${article.url}>`,
  });

  console.log(result);
};
