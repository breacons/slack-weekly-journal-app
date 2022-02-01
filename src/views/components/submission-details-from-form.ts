import { Bits, Blocks, Elements, Modal } from 'slack-block-builder';
import { ArticleCategory } from '.prisma/client';
import { VIEW_FILL_FORM_SUBMISSION } from '../../constants/views';
import {
  FIELDS_SUBMISSION_CATEGORIES,
  FIELDS_SUBMISSION_RECOMMENDATION,
  FIELDS_SUBMISSION_URL,
} from '../../constants/fields';

export const submissionDetailsModalFromForm = ({ journal, message }: any) => {
  return Modal({
    title: 'New Submission',
    submit: 'Finalise',
    callbackId: JSON.stringify({ callbackId: VIEW_FILL_FORM_SUBMISSION, ...message }),
  })
    .blocks(
      Blocks.Input({ label: 'Link' })
        .element(
          Elements.TextInput({
            placeholder: 'Paste here the link of the article',
          }).actionId(FIELDS_SUBMISSION_URL),
        )
        .blockId(FIELDS_SUBMISSION_URL),
      Blocks.Input({ label: 'Your Recommendation' })
        .element(
          Elements.TextInput({
            placeholder: "Why do you think this article is exciting?",
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
