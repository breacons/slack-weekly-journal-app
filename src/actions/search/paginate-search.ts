import { handleSearch } from './handle-search';

export const paginateSearch = async ({ payload, context, body, client, ack }: any) => {
  await ack();
  const { page, searchPhrase } = JSON.parse(payload.action_id);

  await handleSearch({ searchPhrase, context, page, client, body });
};
