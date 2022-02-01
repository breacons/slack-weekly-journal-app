import { handleSearch } from './handle-search';

export const submitSearch = async ({ context, body, payload, view, ack, client }: any) => {
  await ack();
  const searchPhrase = payload.value;
  await handleSearch({ searchPhrase, context, page: 1, client, body });
};
