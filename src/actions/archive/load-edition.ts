import { renderHomeTab } from '../../events/render-home-tab';

export const loadEdition = async ({ client, context, payload, ack }: any) => {
  const { editionId } = JSON.parse(payload.action_id);

  await ack({ response_action: 'clear' }); // FIXME: we wanted to close the modal automatically here
  await renderHomeTab({ client, context, editionId });
};
