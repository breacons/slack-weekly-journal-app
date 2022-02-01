import { createCanvas, loadImage, registerFont } from 'canvas';
import { random, sampleSize } from 'lodash';
import * as dayjs from 'dayjs';

registerFont('assets/fonts/Merriweather-Bold.ttf', { family: 'Merriweather' });
registerFont('assets/fonts/NotoSans-Bold.ttf', { family: 'NotoSans' });

interface CoverProps {
  imageUrl: string | null;
  editionNumber: number;
  date: Date;
  journalName: string;
  editorNumber: number;
  topicNumber: number;
  articleNumber: number;
}

export const createCover = async ({
  imageUrl,
  editionNumber,
  date,
  journalName,
  editorNumber,
  articleNumber,
  topicNumber,
}: CoverProps) => {
  const background = await loadImage('assets/image/background.jpg');

  const canvas = createCanvas(1920, 1080);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#000';

  ctx.drawImage(background, 0, 0, 1920, 1080);

  ctx.font = '52px Merriweather';
  ctx.fillText(`#${editionNumber} Edition - ${dayjs(date).format('MMMM YYYY')}`, 100, 160);
  ctx.font = '92px Merriweather';
  ctx.fillText(journalName, 100, 290);

  ctx.font = '118px NotoSans';
  ctx.fillText(editorNumber.toString(), 120, 886);
  ctx.fillText(topicNumber.toString(), 540, 886);
  ctx.fillText(articleNumber.toString(), 945, 880);

  if (imageUrl) {
    const image = await loadImage(imageUrl);
    const targetHeight = 450;
    const scale = targetHeight / image.height;
    ctx.fillStyle = '#fff';
    ctx.fillRect(1240, 370, image.width * scale, targetHeight);
    ctx.globalCompositeOperation = 'luminosity';
    ctx.drawImage(image, 1240, 370, image.width * scale, targetHeight);
  }

  ctx.globalCompositeOperation = 'multiply';
  ctx.fillStyle = '#DF1D5A';
  ctx.fillRect(1690, 340, 270, 60);

  return canvas.toBuffer('image/jpeg');
};

const slackColors = ['#36C5F1', '#DF1D5A', '#2DB67E', '#EBB22D'];

interface ThumbnailProps {
  editionNumber: number;
}
export const createThumbnail = async ({ editionNumber }: ThumbnailProps) => {
  const background = await loadImage('assets/image/thumbnail-bg.png');

  const canvas = createCanvas(250, 250);
  const ctx = canvas.getContext('2d');

  ctx.drawImage(background, 0, 0, 250, 250);

  const colors = sampleSize(slackColors, 2);

  for (const color of colors) {
    const x = random(0, 200);
    const y = random(0, 200);
    const width = random(30, 250);
    const height = random(30, 250);

    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
  }

  ctx.font = '80px Merriweather';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#000';
  ctx.fillText(`#${editionNumber}`, 250 / 2, 155);

  return canvas.toBuffer('image/png');
};
