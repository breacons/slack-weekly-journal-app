import { filterByCategory } from './filter-by-category';
import { set } from 'lodash';

export const paginateEdition = async ({ payload, context, body, client, ack }: any) => {
  await ack();
  const { page, edition, category } = JSON.parse(payload.action_id);

  await filterByCategory({
    context,
    payload:
      set(payload, 'selected_option.value', JSON.stringify({
        category,
        edition,
        currentPage: page,
      }),
    ),
    client,
    body,
  });
};
