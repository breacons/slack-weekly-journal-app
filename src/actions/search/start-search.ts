import { app } from '../../app';
import { searchModal } from '../../views/components/search-modal';

export const startSearch = async ({ context, body, ack }) => {
  await ack();
  const modal = searchModal({ page: 1 });

  try {
    await app.client.views.open({
      token: context.botToken,
      trigger_id: body.trigger_id,
      view: modal,
    });
  } catch (error) {
    console.error(JSON.stringify(error));
  }
};
