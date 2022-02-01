import { Bits, Blocks, EasyPaginator, Elements, HomeTab, Image } from 'slack-block-builder';
import { Article, ArticleCategory, Edition } from '.prisma/client';
import { articleListItem } from './components/article-list-item';
import { partition as _partition } from 'lodash';
import {
  ACTIONS_ARCHIVE_START,
  ACTIONS_BACK_TO_CURRENT,
  ACTIONS_EDITION_PAGINATE,
  ACTIONS_FILTER_BY_CATEGORY,
  ACTIONS_HOME_MAIN_OPTIONS,
  ACTIONS_PREFERENCES_START,
  ACTIONS_REWARDS_START,
  ACTIONS_SEARCH_START,
  ACTIONS_SETTINGS_START,
} from '../constants/actions';
import { ALL_CATEGORIES } from '../constants/options';

type ArticleWithSubmissions = {
  article: Article;
  submissions: { recommendation: string; userId: string }[];
  categories: ArticleCategory[];
};

interface Props {
  articles: ArticleWithSubmissions[];
  categories: ArticleCategory[];
  selectedCategory?: null | ArticleCategory;
  edition: Edition;
  currentEditionId: number;
  currentPage?: number;
  hiddenCategories: ArticleCategory[];
}

const allArticlesLabel = 'All topics';
export const editionHomeTab = ({
  articles = [],
  categories,
  selectedCategory,
  edition,
  currentEditionId,
  currentPage = 1,
  hiddenCategories,
}: Props) => {
  const [notDisplayedCategories, displayedCategories] = _partition(categories, (category) =>
    hiddenCategories.find((hidden) => hidden.id === category.id),
  );

  return HomeTab()
    .blocks(
      Blocks.Section({ text: ` ` }).accessory(
        Elements.OverflowMenu()
          .options(
            Bits.Option({ text: 'Rewards', value: ACTIONS_REWARDS_START }),
            Bits.Option({ text: 'Preferences', value: ACTIONS_PREFERENCES_START }),
            Bits.Option({ text: 'Settings', value: ACTIONS_SETTINGS_START }),
          )
          .actionId(ACTIONS_HOME_MAIN_OPTIONS),
      ),
      Image({
        imageUrl: edition.coverImage,
        altText: 'Edition Cover',
      }),
      Blocks.Actions().elements(
        Elements.StaticSelect({ placeholder: 'Jump to topic' })
          .optionGroups(
            Bits.OptionGroup({ label: 'Topics' }).options(
              Bits.Option({
                text: allArticlesLabel,
                value: JSON.stringify({
                  category: ALL_CATEGORIES,
                  edition: edition.id,
                  currentPage,
                }),
              }),
              ...displayedCategories.map((category) =>
                Bits.Option({
                  text: category.title,
                  value: JSON.stringify({
                    category: category.id.toString(),
                    edition: edition.id,
                    currentPage,
                  }),
                }),
              ),
            ),
            notDisplayedCategories.length > 0
              ? Bits.OptionGroup({ label: 'Hidden Topics' }).options(
                  ...notDisplayedCategories.map((category) =>
                    Bits.Option({
                      text: category.title,
                      value: JSON.stringify({
                        category: category.id.toString(),
                        edition: edition.id,
                        currentPage,
                      }),
                    }),
                  ),
                )
              : null,
          )
          .initialOption(
            Bits.Option({
              text: selectedCategory ? selectedCategory.title : allArticlesLabel,
              value: JSON.stringify({
                category: selectedCategory ? selectedCategory.id.toString() : ALL_CATEGORIES,
                edition: edition.id,
                currentPage,
              }),
            }),
          )
          .actionId(ACTIONS_FILTER_BY_CATEGORY),
        Elements.Button({ text: 'Search' }).actionId(ACTIONS_SEARCH_START),
        Elements.Button({ text: 'Archives' })
          .actionId(ACTIONS_ARCHIVE_START)
          .primary(edition.id !== currentEditionId),
        edition.id !== currentEditionId
          ? Elements.Button({ text: 'Current edition' }).actionId(ACTIONS_BACK_TO_CURRENT)
          : null,
      ),
      // Placeholder(),
      articles.length > 0
        ? EasyPaginator({
            perPage: 10,
            items: articles, // The entire data set
            page: currentPage || 1,
            actionId: ({ page, offset, buttonId }) =>
              JSON.stringify({
                actionId: ACTIONS_EDITION_PAGINATE,
                buttonId,
                page,
                offset,
                edition: edition.id,
                category: selectedCategory ? selectedCategory.id.toString() : ALL_CATEGORIES,
              }),
            blocksForEach: ({ item: article }, index) =>
              articleListItem({
                ...article,
                first: index === 0,
                last: index >= articles.length - 3, // FIXME: seems like index is not working
                edition,
                selectedCategory,
                currentPage,
              }),
          }).getBlocks()
        : Image({
            imageUrl: 'https://storage.googleapis.com/slack-digital-hq/empty-journal.jpg',
            altText: 'Empty',
          }),
    )
    .buildToObject();
};
