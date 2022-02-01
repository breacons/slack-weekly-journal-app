import { Bits, Blocks, Elements, Image, Md } from 'slack-block-builder';
import { Article, ArticleCategory, Edition } from '.prisma/client';
import { Placeholder } from './placeholder';
import * as dayjs from 'dayjs';
import {
  ACTIONS_ARTICLE_DETAILS,
  ACTIONS_ARTICLE_REVIEWS_START,
  ACTIONS_ARTICLE_SHARE_START,
  ACTIONS_REACT_ON_ARTICLE,
  ACTIONS_REACT_ON_ARTICLE_ADD,
  ACTIONS_REACT_ON_ARTICLE_REMOVE,
} from '../../constants/actions';
import * as _ from 'lodash';
import { reactionOptions } from '../../constants/reactions';
import { reject as _reject, isNull as _isNull } from 'lodash';
import { defaultLogo, defaultThumbnail } from '../../constants/placeholders';

interface Props {
  article: Article;
  submissions: { recommendation: string; userId: string }[];
  categories: ArticleCategory[];
  first: boolean;
  last: boolean;
  selectedCategory?: null | ArticleCategory;
  edition: Edition;
  reactions?: any;
  currentPage?: number;
}

export const articleListItem = ({
  article,
  submissions,
  categories,
  first,
  last,
  edition,
  selectedCategory,
  reactions,
  currentPage = 1,
}: Props) => {
  // console.log('articleListItem', article);

  const allReactions = reactionOptions.map((reaction) => {
    return {
      count: 0,
      checked: false,
      ...reaction,
      ...reactions.find((r) => r.reaction === reaction.value),
    };
  });

  const recommendation = _.sample(submissions);

  return [
    first ? null : Placeholder(),
    Blocks.Context().elements(
      Elements.Img({
        imageUrl: article.logo && article.logo.length < 400 ? article.logo : defaultLogo,
        altText: 'Logo',
      }),
      ` ${_reject(
        [
          article.author || null,
          article.date ? dayjs(article.date).format('YYYY. MM. DD.') : null,
          categories.map((category: ArticleCategory) => category.title).join(', '),
        ],
        _isNull,
      ).join('  |  ')}`,
    ),
    Blocks.Section({
      text: `*${Md.link(article.url, article.title || article.url)}* \n${
        article.description || ''
      }`,
    }).accessory(
      Image({ imageUrl: article.image || defaultThumbnail, altText: article.title || 'Thumbnail' }),
    ),
    Blocks.Section({
      text: `_${Md.user(recommendation.userId)}:_\n_${Md.blockquote(
        recommendation.recommendation,
      )}_`,
    }).accessory(
      Elements.OverflowMenu()
        .options(
          Bits.Option({
            text: 'Reviews & Reactions',
            value: JSON.stringify({
              actionId: ACTIONS_ARTICLE_REVIEWS_START,
              articleId: article.id,
            }),
          }),
          Bits.Option({
            text: 'Share',
            value: JSON.stringify({ actionId: ACTIONS_ARTICLE_SHARE_START, articleId: article.id }),
          }),
        )
        .actionId(ACTIONS_ARTICLE_DETAILS),
    ),
    // .accessory(Elements.Button({ text: '...' })),
    Blocks.Actions().elements(
      ...allReactions.map(
        (reaction) =>
          Elements.Button({
            text: `${reaction.emoji} ${reaction.count !== 0 ? `  ${reaction.count}` : ''}`,
          })
            .value(reaction.value)
            .actionId(
              JSON.stringify({
                action_id: ACTIONS_REACT_ON_ARTICLE,
                articleId: article.id,
                reaction: reaction.value,
                method: reaction.checked
                  ? ACTIONS_REACT_ON_ARTICLE_REMOVE
                  : ACTIONS_REACT_ON_ARTICLE_ADD,
                editionId: edition.id,
                categoryId: selectedCategory ? selectedCategory.id : null,
                currentPage,
              }),
            )
            .primary(reaction.checked), // TODO
      ),
    ),
    Placeholder(),
    last ? null : Blocks.Divider(),
  ];
};
