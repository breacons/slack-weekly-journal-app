import { Context, Elements } from 'slack-block-builder';

export const Placeholder = () => {
  return Context().elements(
    Elements.Img({
      imageUrl: 'https://api.slack.com/img/blocks/bkb_template_images/placeholder.png',
      altText: 'placeholder',
    }),
  );
};
