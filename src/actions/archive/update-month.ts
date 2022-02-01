import { transformFormValues } from '../../utils/transform-form-values';
import { ACTIONS_ARCHIVE_SET_MONTH, ACTIONS_ARCHIVE_SET_YEAR } from '../../constants/actions';
import { updateArchiveFilter } from './update-filter';

export const updateMonth = async ({ context, payload, view, client, body, ack }: any) => {
  await ack();
  const values = transformFormValues(body.view.state.values);
  const year = parseInt(values[ACTIONS_ARCHIVE_SET_YEAR], 10);
  const month = parseInt(values[ACTIONS_ARCHIVE_SET_MONTH], 10);

  await updateArchiveFilter({ context, view, body, year, month, client });
};
