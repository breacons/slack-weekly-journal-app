import { prisma } from '../../db';
import { Blocks, Elements, Image, Md, Modal } from 'slack-block-builder';
import * as _ from 'lodash';
import { reactionDictionary, reactionOptions } from '../../constants/reactions';
import { ArticleReaction } from '.prisma/client';
import { defaultThumbnail } from '../../constants/placeholders';
import { Placeholder } from './placeholder';
import { Element } from 'slack-block-builder/dist/internal';

interface Props {
  reactions: ArticleReaction[][];
}

// Awards, achievements
// Context - what more countinue  on to earn more awards - link: other available
// Leaderboard

// These would ideally come from the database, but it's out of scope for the hackathon
const achievements = [
  {
    title: 'Editor of the Week',
    description:
      'All we can say is that we are proud of you! You are taking important role in educating our team, and the stories you share are shaping our personal and professional knowledgebase.',
    thumbnail: '',
    level: 3,
  },

  {
    title: 'You Are on Fire!',
    description:
      'Readers find your stories extremely hot! You have received more than 10 🔥 reactions on your submissions.',
    thumbnail: '',
    level: 1,
  },
  {
    title: 'Cross-Industry Hero',
    description:
      'You have shared stories in more than 5 topics and tried to find something exciting for all members of our community.',
    thumbnail: '',
    level: 2,
  },
  {
    title: '5 Weeks Streak',
    description:
      'Consistency is key! You are sharing new content week after week, and we truly appreciate your efforts! 🙌',
    thumbnail: '',
    level: 1,
  },
];

export const rewardsModal = ({ reactions }: Props) => {
  return Modal({ title: 'Rewards' })
    .blocks(
      Blocks.Header({ text: 'Reactions' }),
      Blocks.Context().elements(
        'Other readers are taking notice about your submissions. Here is how they react.',
      ),
      Blocks.Section({
        text: `${reactions
          .map(
            (reactionCategory) =>
              `*${reactionCategory.length}x* ${reactionCategory
                .map((reaction) => reactionDictionary[reaction.reaction])
                .join(' ')}`,
          )
          .join('\n\n')}`,
      }),
      Placeholder(),
      Blocks.Divider(),
      Placeholder(),
      Blocks.Header({ text: 'Achievements' }),
      ...achievements.map((achievement, index) => [
        Blocks.Section({
          text: `*${achievement.title}*   |   Level ${achievement.level}\n${
            achievement.description || ''
          }`,
        }).accessory(
          Image({
            imageUrl:
              `https://storage.googleapis.com/slack-digital-hq/achievement-${index + 1}.jpg` ||
              defaultThumbnail,
            altText: achievement.title || 'Thumbnail',
          }),
        ),
        Placeholder(),
        Blocks.Divider(),
        Placeholder(),
      ]),

      // Blocks.Header({ text: 'Leaderboard' }),
    )
    .buildToObject();
};
