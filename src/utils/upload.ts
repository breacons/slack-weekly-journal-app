const { Storage } = require('@google-cloud/storage');
const path = require('path')
const serviceKey = './keys/keys.json'
// Creates a client
const storage = new Storage({
  keyFilename: serviceKey,
  projectId: 'slack-digital-hq', // TODO .env
})


interface Props {
  fileName: string;
  buffer: Buffer;
}
export async function uploadFile({ fileName, buffer }: Props) {
  const bucketName = 'slack-digital-hq' // TODO .env
  // const fileName = 'covers/1.jpg'
  // const result = await  storage.bucket(bucketName).upload('./image.jpg', {
  //   destination: fileName,
  // });

  const file = await storage.bucket(bucketName).file(fileName);

  return  await file.save(buffer, async (err) => {
    if (!err) {
      await storage.bucket('slack-digital-hq').file(fileName).makePublic()

      const link = `https://storage.googleapis.com/${bucketName}/${fileName}`
      return link
    } else {
      console.log('error ' + err);
    }
  });
}
