import { Blocks, Elements, Md, Image } from 'slack-block-builder';
import { Article, ArticleCategory } from '.prisma/client';
import { Placeholder } from './placeholder';
import * as dayjs from 'dayjs';
import { reject as _reject, isNull as _isNull } from 'lodash';

interface Props {
  article: Article | any;
  // submissions: { recommendation: string; userId: string }[];
  categories: ArticleCategory[];
  first: boolean;
  last: boolean;
}

const defaultThumbnail =
  'https://storage.googleapis.com/slack-digital-hq/thumbnails/article-thumbnail.png';
const defaultLogo = 'https://storage.googleapis.com/slack-digital-hq/thumbnails/article-logo.png';

export const articleSearchListItem = ({ article, categories, first, last }: Props) => {
  return [
    first ? null : Placeholder(),
    Blocks.Context().elements(
      Elements.Img({ imageUrl: article.logo || defaultLogo, altText: 'Logo' }),
      ` ${_reject(
        [
          article.author || null,
          article.date ? dayjs(article.date).format('YYYY. MM. DD.') : null,
          article.submissions[0].edition
            ? `#${article.submissions[0].edition.number} Edition`
            : null,
          article.submissions.map((s) => Md.user(s.userId)).join(', '),
        ],
        _isNull,
      ).join('  |  ')}`,
    ),
    Blocks.Section({
      text: `*${Md.link(article.url, article.title)}* \n${article.description || ""}`,
    }).accessory(
      Image({ imageUrl: article.image || defaultThumbnail, altText: article.title || 'Thumbnail' }),
    ),
    Placeholder(),
    last ? null : Blocks.Divider(),
  ];
};
