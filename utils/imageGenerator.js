const { createCanvas, registerFont } = require('canvas');
const fs = require('fs');
const path = require('path');
const moment = require('moment');

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

try {
  const fontDir = path.join(__dirname, '../assets');
  registerFont(path.join(fontDir, 'Poppins-Regular.ttf'), { family: 'Poppins' });
  registerFont(path.join(fontDir, 'Poppins-Bold.ttf'), { family: 'Poppins Bold' });
} catch (error) {
  console.log('Poppins font not available, using system font');
}

exports.generateScoreCard = async (data) => {
  const { userName, rank, totalScore, userId } = data;

  const canvas = createCanvas(1280, 720);
  const ctx = canvas.getContext('2d');

  const leftWidth = 0.3 * 1280;
  const rightWidth = 0.7 * 1280;

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, leftWidth, 720);

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(leftWidth, 0, rightWidth, 720);

  ctx.font = 'bold 96px "Poppins", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${rank}`, leftWidth / 2, 360);

  ctx.font = 'bold 48px "Poppins", sans-serif';
  ctx.fillStyle = '#000000';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('Score Card', leftWidth + rightWidth / 2, 100);

  ctx.font = 'bold 36px "Poppins", sans-serif';
  ctx.fillStyle = '#007BFF';
  ctx.fillText(`${userName}`, leftWidth + rightWidth / 2, 200);

  ctx.font = '36px "Poppins", sans-serif';
  ctx.fillStyle = '#000000';
  ctx.fillText(`Score: ${totalScore}`, leftWidth + rightWidth / 2, 300);

  const currentDate = moment().format('Do MMMM YY');
  ctx.font = '24px "Poppins", sans-serif';
  ctx.fillStyle = '#000000';
  ctx.fillText(`Date: ${currentDate}`, leftWidth + rightWidth / 2, 370);

  const imageName = `score_card_${userId}_${Date.now()}.jpeg`;
  const imagePath = path.join(uploadDir, imageName);

  const buffer = canvas.toBuffer('image/jpeg');
  fs.writeFileSync(imagePath, buffer);

  return {
    fileName: imageName,
    filePath: imagePath,
    url: `/uploads/${imageName}`
  };
};
