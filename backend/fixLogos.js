const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });
const Brand = require('./models/Brand');

const fixes = {
  'Louis Vuitton': 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Louis_Vuitton_logo_and_wordmark.svg',
  'Chanel': 'https://upload.wikimedia.org/wikipedia/en/9/92/Chanel_logo_interlocking_cs.svg',
  'Dior': 'https://upload.wikimedia.org/wikipedia/commons/a/a8/Dior_Logo.svg',
  'Hermès': 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Herm%C3%A8s_logo.svg',
  'Burberry': 'https://upload.wikimedia.org/wikipedia/commons/3/30/Burberry_logo.svg',
  'Balenciaga': 'https://upload.wikimedia.org/wikipedia/commons/7/77/Balenciaga_Logotype.svg',
  'Rolex': 'https://upload.wikimedia.org/wikipedia/en/0/05/Rolex_logo.svg',
  'Cartier': 'https://upload.wikimedia.org/wikipedia/commons/2/23/Cartier_logo.svg',
  'Versace': 'https://upload.wikimedia.org/wikipedia/commons/0/06/Versace_logo.svg',
  'Fendi': 'https://upload.wikimedia.org/wikipedia/commons/8/87/Fendi_logo.svg',
  'Saint Laurent': 'https://upload.wikimedia.org/wikipedia/commons/6/69/Yves_Saint_Laurent_Logo.svg',
  'Givenchy': 'https://upload.wikimedia.org/wikipedia/commons/c/cf/Givenchy_logo.svg',
  'Bottega Veneta': 'https://upload.wikimedia.org/wikipedia/commons/2/24/Bottega_Veneta_logo.svg',
  'Valentino': 'https://upload.wikimedia.org/wikipedia/commons/3/30/Valentino_logo.svg',
  'Ralph Lauren': 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Polo_Ralph_Lauren_logo.svg',
  'Armani': 'https://upload.wikimedia.org/wikipedia/commons/b/b6/Giorgio_Armani_logo.svg',
  'Tom Ford': 'https://upload.wikimedia.org/wikipedia/commons/0/0c/Tom_Ford_logo.svg',
  'Moncler': 'https://upload.wikimedia.org/wikipedia/commons/6/63/Moncler_logo.svg'
};

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to DB to fix logos');
    
    for (const [name, logo] of Object.entries(fixes)) {
      await Brand.updateOne({ name }, { $set: { logo } });
    }
    
    console.log('Successfully fixed logos');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
