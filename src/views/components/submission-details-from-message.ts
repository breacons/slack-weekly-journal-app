import { partition, reject as _reject } from 'lodash';
import { Bits, Blocks, Elements, Image, Md, Modal } from 'slack-block-builder';
import { ACTIONS_ADD_CATEGORY, ACTIONS_REMOVE_CATEGORY } from '../../constants/actions';
import { ArticleCategory } from '.prisma/client';
import { VIEW_FILL_SUBMISSION } from '../../constants/views';
import {
  FIELDS_SUBMISSION_CATEGORIES,
  FIELDS_SUBMISSION_RECOMMENDATION,
  FIELDS_SUBMISSION_URL,
} from '../../constants/fields';
import * as dayjs from 'dayjs';
import { defaultLogo, defaultThumbnail } from '../../constants/placeholders';
import { isNull as _isNull } from 'lodash';
import { Placeholder } from './placeholder';

export const submissionDetailsModalFromMessage = ({ journal, url, message, article }: any) => {
  return Modal({
    title: 'New Submission',
    submit: 'Finalise',
    callbackId: JSON.stringify({ callbackId: VIEW_FILL_SUBMISSION, ...message, url }),
  })
    .blocks(
      Blocks.Context().elements(
        Elements.Img({ imageUrl: article.logo || defaultLogo, altText: 'Logo' }),
        ` ${_reject(
          [
            article.author || null,
            article.date ? dayjs(article.date).format('YYYY. MM. DD.') : null,
          ],
          _isNull,
        ).join('  |  ')}`,
      ),
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
      // Blocks.Input({ label: 'Link' })
      //   .element(
      //     Elements.TextInput({ placeholder: 'Paste here the link of the article' })
      //       .actionId(FIELDS_SUBMISSION_URL)
      //       .initialValue(url),
      //   )
      //   .blockId(FIELDS_SUBMISSION_URL),
      Placeholder(),
      Blocks.Divider(),
      Blocks.Input({ label: 'Your Recommendation' })
        .element(
          Elements.TextInput({
            placeholder: 'Why do you think this article is exciting?',
          })
            .multiline(true)
            .actionId(FIELDS_SUBMISSION_RECOMMENDATION),
        )
        .blockId(FIELDS_SUBMISSION_RECOMMENDATION),
      Blocks.Input({ label: 'Categories' })
        .element(
          Elements.StaticMultiSelect({ placeholder: 'Where would you place this article?' })
            .actionId(FIELDS_SUBMISSION_CATEGORIES)
            .options(
              journal.categories.map((item: ArticleCategory) =>
                Bits.Option({ text: item.title, value: item.id.toString() }),
              ),
            ),
        )
        .blockId(FIELDS_SUBMISSION_CATEGORIES),
    )
    .buildToObject();
};
