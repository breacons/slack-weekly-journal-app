import { set as _set } from 'lodash';

const getValue = (object: any) => {
  if (object.type === 'plain_text_input') {
    return object.value;
  }

  if (object.type === 'static_select') {
    return object.selected_option.value;
  }

  if (object.type === 'timepicker') {
    return object.selected_time;
  }

  if (object.type === 'channels_select') {
    return object.selected_channel;
  }

  if (object.type === 'checkboxes') {
    return object.selected_options.map((option) => ({ id: parseInt(option.value, 10) }));
  }

  // FIXME
  if (object.type === 'multi_static_select') {
    return object.selected_options.map((option) => ({ id: parseInt(option.value, 10) }));
  }
};

export const transformFormValues = (values) =>
  Object.values(values).reduce((all: any, object: any) => {
    return Object.entries(object).reduce((subAll, [key, valueObject]) => {
      const value = getValue(valueObject);
      return _set(subAll, key, value);
    }, all);

    // const [key, valueObject]: any = Object.entries(object)[0];
    // const value = getValue(valueObject);
    // return _set(all, key, value);
  }, {});
