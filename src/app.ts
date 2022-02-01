import './utils/env';
import 'reflect-metadata';
import { App, LogLevel } from '@slack/bolt';
import { handleSubmissionMessage } from './messages/submission-message';
import {
  ACTIONS_ADD_CATEGORY,
  ACTIONS_ARCHIVE_SET_MONTH,
  ACTIONS_ARCHIVE_SET_YEAR,
  ACTIONS_ARCHIVE_START,
  ACTIONS_ARTICLE_DETAILS,
  ACTIONS_ARTICLE_SHARE_CHANGE,
  ACTIONS_BACK_TO_CURRENT,
  ACTIONS_CREATE_JOURNAL,
  ACTIONS_EDITION_PAGINATE,
  ACTIONS_FILL_SUBMISSION_START,
  ACTIONS_FILTER_BY_CATEGORY,
  ACTIONS_HOME_MAIN_OPTIONS,
  ACTIONS_LOAD_EDITION,
  ACTIONS_PREFERENCES_SUBMIT,
  ACTIONS_PUBLISH_NEW_EDITION,
  ACTIONS_REACT_ON_ARTICLE,
  ACTIONS_REMOVE_CATEGORY,
  ACTIONS_SEARCH_PAGINATE,
  ACTIONS_SEARCH_START,
  ACTIONS_SEARCH_SUBMIT,
  ACTIONS_SETTINGS_SUBMIT,
} from './constants/actions';
import { handleFillSubmissionStart } from './actions/submission/fill-submission-start';
import {
  VIEW_FILL_FORM_SUBMISSION,
  VIEW_FILL_SUBMISSION,
  VIEW_SHARE_ARTICLE,
} from './constants/views';
import { handleFillSubmissionFinish } from './actions/submission/fill-submission-finish';
import { renderHomeTab } from './events/render-home-tab';
import { prisma } from './db';
import { addArticleCategory } from './actions/home-main-options/settings/add-article-category';
import { removeArticleCategory } from './actions/home-main-options/settings/remove-article-category';
import { get, get as _get } from 'lodash';
import { createEdition } from './actions/edition/create-edition';
import { filterByCategory } from './actions/edition/filter-by-category';
import { startSearch } from './actions/search/start-search';
import { submitSearch } from './actions/search/submit-search';
import { paginateSearch } from './actions/search/paginate-search';
import { openArchive } from './actions/archive/open-archive';
import { updateYear } from './actions/archive/update-year';
import { updateMonth } from './actions/archive/update-month';
import { loadEdition } from './actions/archive/load-edition';
import { reactToArticle } from './actions/reaction/react-to-article';
import { articleDetails } from './actions/article-details';
import { handleShareArticle } from './actions/article-details/share-article';
import { paginateEdition } from './actions/edition/paginate-edition';
import { homeMainOptions } from './actions/home-main-options';
import { submitSettings } from './actions/home-main-options/settings/submit-settings';
import { submitPreferences } from './actions/home-main-options/preferences/submit-preferences';
import { Blocks, Message, user } from 'slack-block-builder';
import { seed } from './seed';
import { startFormShare } from './shortcuts/start-form-share';
import { handleFillFormSubmissionFinish } from './actions/submission/fill-submission-finish-from-form';

// npx prisma migrate dev

export const app = new App({
  appToken: process.env.SLACK_APP_TOKEN,
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  logLevel: LogLevel.INFO,
  socketMode: true,
});

const urlRegex =
  /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/;

app.message(urlRegex, handleSubmissionMessage);

const timer = (ms) => new Promise((res) => setTimeout(res, ms));
app.message('clear', async ({ body, message, say }) => {
  await say({
    ...Message()
      .blocks(...Array(50).fill(Blocks.Section({ text: ` \n \t \n` })))
      .buildToObject(),
  });
  await say({
    ...Message()
      .blocks(...Array(50).fill(Blocks.Section({ text: ` \n \t \n` })))
      .buildToObject(),
  });
  // await timer(10000)
  // await say({
  //   text: "Welcome to the *Slackathon Weekly Journal! 🗞*\nFound some great article that might interest others? Share it here and we will publish it in next week's edition. 🚀",
  // });
  // const messageId = get(body, 'message.ts') || get(body, 'container.message_ts');
  // const channelId = get(body, 'channel.id') || get(body, 'body.container.channel_id');
  //
  // const a = await app.client.conversations.history({ channel: message.channel });
  // // console.log(a);
  // //
  // // const promises = a.messages.map((m) =>
  // //
  // // );
  //
  // for (const m of a.messages) {
  //   try {
  //     await app.client.chat.delete({ channel: message.channel, ts: m.ts, as_user: true })
  //
  //   }
  //   catch (e) {
  //     console.error(JSON.stringify(e))
  //   }
  //   await timer(1000)
  // }

  // await Promise.all(promises)
});

app.action(ACTIONS_FILL_SUBMISSION_START, handleFillSubmissionStart);
app.view(new RegExp(VIEW_FILL_SUBMISSION, 'g'), handleFillSubmissionFinish);
app.view(new RegExp(VIEW_FILL_FORM_SUBMISSION, 'g'), handleFillFormSubmissionFinish);

app.event('app_home_opened', renderHomeTab);

app.action(ACTIONS_HOME_MAIN_OPTIONS, homeMainOptions);
app.view(ACTIONS_SETTINGS_SUBMIT, submitSettings);
app.view(ACTIONS_PREFERENCES_SUBMIT, submitPreferences);
app.action(ACTIONS_ADD_CATEGORY, addArticleCategory);
app.action(ACTIONS_REMOVE_CATEGORY, removeArticleCategory);

app.action(ACTIONS_FILTER_BY_CATEGORY, filterByCategory);
app.action(ACTIONS_SEARCH_START, startSearch);
app.action(ACTIONS_SEARCH_SUBMIT, submitSearch);
app.action(new RegExp(ACTIONS_SEARCH_PAGINATE, 'g'), paginateSearch);

app.action(ACTIONS_BACK_TO_CURRENT, renderHomeTab);
app.action(ACTIONS_ARCHIVE_START, openArchive);
app.action(ACTIONS_ARCHIVE_SET_YEAR, updateYear);
app.action(ACTIONS_ARCHIVE_SET_MONTH, updateMonth);
app.action(new RegExp(ACTIONS_LOAD_EDITION, 'g'), loadEdition);

app.action(new RegExp(ACTIONS_REACT_ON_ARTICLE, 'g'), reactToArticle);
app.action(new RegExp(ACTIONS_EDITION_PAGINATE, 'g'), paginateEdition);

app.action(ACTIONS_ARTICLE_DETAILS, articleDetails);
app.action(ACTIONS_ARTICLE_SHARE_CHANGE, async ({ ack }) => await ack());
app.view(VIEW_SHARE_ARTICLE, handleShareArticle);

app.shortcut(ACTIONS_PUBLISH_NEW_EDITION, createEdition);

app.command('/share-story', startFormShare);
app.shortcut('SHARE_STORY_FORM', startFormShare);

app.use(async ({ next, client, body, payload, context, ...rest }) => {
  const teamId = _get(body, 'team.id') || _get(context, 'teamId');
  const userId =
    _get(body, 'user.id') ||
    _get(payload, 'user') ||
    _get(payload, 'message.user') ||
    _get(body, 'user_id');

  if (!teamId || !userId) {
    console.error('ID not found:', { teamId, userId });
  }

  let journal = await prisma.journal.findUnique({
    where: {
      workspaceId: teamId,
    },
  });

  if (!journal) {
    journal = await prisma.journal.create({
      data: {
        workspaceId: teamId,
        releaseTime: '08:00',
      },
    });

    await prisma.articleCategory.create({
      data: {
        journalId: journal.id,
        title: 'General', // TODO: description needed?
        deletable: false,
      },
    });
  }

  let user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      hiddenCategories: true,
    },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        id: userId,
        firstName: '', // TODO: fetch this
        journalId: journal.id,
      },
      include: {
        hiddenCategories: true,
      },
    });
  }

  context.user = user;
  context.journal = journal;

  await next();
});

(async () => {
  // Start your app
  await app.start(Number(process.env.PORT) || 3000);
  console.log('⚡️ Bolt app is running! ');
})();

// seed()
