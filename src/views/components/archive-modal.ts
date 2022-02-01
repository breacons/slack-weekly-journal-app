import { Bits, Blocks, Elements, Image, Modal } from 'slack-block-builder';
import {
  ACTIONS_ARCHIVE_SET_MONTH,
  ACTIONS_ARCHIVE_SET_YEAR,
  ACTIONS_LOAD_EDITION,
  ACTIONS_SEARCH_SUBMIT,
} from '../../constants/actions';
import { Edition } from '.prisma/client';
import * as dayjs from 'dayjs';
import { Placeholder } from './placeholder';
import * as _ from 'lodash';
import { reactionDictionary } from '../../constants/reactions';

interface Props {
  editions?: Edition[];
  year?: string;
  month?: string;
}

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const archiveModal = ({ year, month, editions }: Props) => {
  const modal = Modal({ title: 'Archives' })
    .blocks(
      Blocks.Actions({}).elements(
        Elements.StaticSelect({ placeholder: 'Year' })
          .options(
            Bits.Option({ value: '2022', text: '2022' }),
            Bits.Option({ value: '2021', text: '2021' }),
          )
          .initialOption(Bits.Option({ value: year, text: year }))
          .actionId(ACTIONS_ARCHIVE_SET_YEAR),
        Elements.StaticSelect({ placeholder: 'Month' })
          .options(
            ...monthNames.map((month, index) =>
              Bits.Option({ value: (index + 1).toString(), text: month }),
            ),
          )
          .initialOption(Bits.Option({ value: month, text: monthNames[parseInt(month, 10) - 1] }))
          .actionId(ACTIONS_ARCHIVE_SET_MONTH),
      ),
      ...(editions && editions.length > 0
        ? editions.map((edition, index) => [
            Placeholder(),
            Blocks.Section({
              text: `*#${edition.number} Edition *\n${_.shuffle(
                Object.values(reactionDictionary),
              ).join(' ')}  -  ${_.random(100, 200)} reactions\n\nReleased in ${dayjs(
                edition.releaseDate,
              ).format('MMMM YYYY')}.\nIncludes ${
                (edition as any)._count.submissions
              } exciting articles.`,
            }).accessory(
              Image({
                imageUrl: edition.thumbnailImage,
                altText: 'thumbnail',
              }),
            ),
            Blocks.Section({ text: ' ' }).accessory(
              Elements.Button({
                text: 'Read edition',
                actionId: JSON.stringify({
                  action_id: ACTIONS_LOAD_EDITION,
                  editionId: edition.id,
                }),
              }),
            ),
            Placeholder(),
            index < editions.length - 1 ? Blocks.Divider() : null,
          ])
        : [
            Image({
              imageUrl: 'https://storage.googleapis.com/slack-digital-hq/empty-archive.jpg',
              altText: 'Empty',
            }),
          ]),
    )
    .callbackId(ACTIONS_SEARCH_SUBMIT)
    .buildToObject();

  return modal;
};
