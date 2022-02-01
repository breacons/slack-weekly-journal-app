import {ACTIONS_PREFERENCES_START, ACTIONS_REWARDS_START, ACTIONS_SETTINGS_START} from '../../constants/actions';
import { startSettings } from './settings/start-settings';
import {startPreferences} from "./preferences/start-preferences";
import {startRewards} from "./rewards/start-rewards";

export const homeMainOptions = async ({ payload, ack, ...rest }) => {
  await ack();
  const actionId = payload.selected_option.value;

  if (actionId === ACTIONS_SETTINGS_START) {
    await startSettings(rest);
  }

  if (actionId === ACTIONS_PREFERENCES_START) {
    await startPreferences(rest);
  }

  if (actionId === ACTIONS_REWARDS_START) {
    await startRewards(rest);
  }
};
