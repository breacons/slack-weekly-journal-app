import { partition } from 'lodash';
import { Blocks, Elements, Modal, TextInput, Paginator, EasyPaginator } from 'slack-block-builder';
import {
  ACTIONS_ADD_CATEGORY,
  ACTIONS_REMOVE_CATEGORY,
  ACTIONS_SEARCH_PAGINATE,
  ACTIONS_SEARCH_SUBMIT,
} from '../../constants/actions';
import { FIELDS_SEARCH_PHRASE } from '../../constants/fields';
import { Article } from '.prisma/client';
import { articleSearchListItem } from './article-search-list-item';
import { SEARCH_PAGE_SIZE } from '../../constants/pagination';

interface Props {
  results?: Article[];
  searchPhrase?: string;
  page: number;
}

export const searchModal = ({ results = [], searchPhrase, page }: Props) => {
  const totalItems = (results || []).length;
  // const items = results.slice((page - 1) * SEARCH_PAGE_SIZE, page * SEARCH_PAGE_SIZE);

  const modal = Modal({ title: 'Search Articles' })
    .blocks(
      Blocks.Input({ label: 'Search' })
        .element(
          Elements.TextInput({ placeholder: 'What are you looking for?' })
            .actionId(ACTIONS_SEARCH_SUBMIT)
            .initialValue(searchPhrase || ''),
        )
        .dispatchAction(true),

      results.length > 0
        ? EasyPaginator({
            perPage: SEARCH_PAGE_SIZE,
            items: results,
            totalItems: totalItems,
            page: page || 1,
            actionId: ({ page, offset, buttonId }) =>
              JSON.stringify({
                action: ACTIONS_SEARCH_PAGINATE,
                page,
                offset,
                buttonId,
                searchPhrase,
              }),
            blocksForEach: ({ item }, index) =>
              articleSearchListItem({
                article: item,
                first: index === 0,
                last: index >= results.length - 2,
                categories: [],
              }),
          }).getBlocks()
        : Blocks.Image({
            imageUrl: searchPhrase
              ? 'https://storage.googleapis.com/slack-digital-hq/no-search-results.jpg'
              : 'https://storage.googleapis.com/slack-digital-hq/empty-search.jpg',
            altText: 'No results',
          }),
    )

    // .submit('Search')
    .callbackId(ACTIONS_SEARCH_SUBMIT)
    .buildToObject();

  return modal;
};
