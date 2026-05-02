const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });
const Brand = require('./models/Brand');

const brands = [
  { name: 'Gucci', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/Gucci_logo.svg', website: 'https://www.gucci.com', active: true, order: 1 },
  { name: 'Prada', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b8/Prada-Logo.svg', website: 'https://www.prada.com', active: true, order: 2 },
  { name: 'Louis Vuitton', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Louis_Vuitton_logo_and_wordmark.svg/1200px-Louis_Vuitton_logo_and_wordmark.svg.png', website: 'https://eu.louisvuitton.com', active: true, order: 3 },
  { name: 'Chanel', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/92/Chanel_logo_interlocking_cs.svg/1200px-Chanel_logo_interlocking_cs.svg.png', website: 'https://www.chanel.com', active: true, order: 4 },
  { name: 'Dior', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Dior_Logo.svg/1200px-Dior_Logo.svg.png', website: 'https://www.dior.com', active: true, order: 5 },
  { name: 'Hermès', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Herm%C3%A8s_logo.svg/1200px-Herm%C3%A8s_logo.svg.png', website: 'https://www.hermes.com', active: true, order: 6 },
  { name: 'Burberry', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Burberry_logo.svg/1200px-Burberry_logo.svg.png', website: 'https://www.burberry.com', active: true, order: 7 },
  { name: 'Balenciaga', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Balenciaga_Logotype.svg/1200px-Balenciaga_Logotype.svg.png', website: 'https://www.balenciaga.com', active: true, order: 8 },
  { name: 'Rolex', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/05/Rolex_logo.svg/1200px-Rolex_logo.svg.png', website: 'https://www.rolex.com', active: true, order: 9 },
  { name: 'Cartier', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Cartier_logo.svg/1200px-Cartier_logo.svg.png', website: 'https://www.cartier.com', active: true, order: 10 },
  { name: 'Versace', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Versace_logo.svg/1200px-Versace_logo.svg.png', website: 'https://www.versace.com', active: true, order: 11 },
  { name: 'Fendi', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Fendi_logo.svg/1200px-Fendi_logo.svg.png', website: 'https://www.fendi.com', active: true, order: 12 },
  { name: 'Saint Laurent', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Yves_Saint_Laurent_Logo.svg/1200px-Yves_Saint_Laurent_Logo.svg.png', website: 'https://www.ysl.com', active: true, order: 13 },
  { name: 'Givenchy', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Givenchy_logo.svg/1200px-Givenchy_logo.svg.png', website: 'https://www.givenchy.com', active: true, order: 14 },
  { name: 'Bottega Veneta', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Bottega_Veneta_logo.svg/1200px-Bottega_Veneta_logo.svg.png', website: 'https://www.bottegaveneta.com', active: true, order: 15 },
  { name: 'Valentino', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Valentino_logo.svg/1200px-Valentino_logo.svg.png', website: 'https://www.valentino.com', active: true, order: 16 },
  { name: 'Ralph Lauren', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Polo_Ralph_Lauren_logo.svg/1200px-Polo_Ralph_Lauren_logo.svg.png', website: 'https://www.ralphlauren.com', active: true, order: 17 },
  { name: 'Armani', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Giorgio_Armani_logo.svg/1200px-Giorgio_Armani_logo.svg.png', website: 'https://www.armani.com', active: true, order: 18 },
  { name: 'Tom Ford', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Tom_Ford_logo.svg/1200px-Tom_Ford_logo.svg.png', website: 'https://www.tomford.com', active: true, order: 19 },
  { name: 'Moncler', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Moncler_logo.svg/1200px-Moncler_logo.svg.png', website: 'https://www.moncler.com', active: true, order: 20 },
  { name: 'Nike', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg', website: 'https://www.nike.com', active: true, order: 21 },
  { name: 'Adidas', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg', website: 'https://www.adidas.com', active: true, order: 22 }
];

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to DB');
    // Don't delete existing brands, just add the new ones
    const existing = await Brand.find({ name: { $in: brands.map(b => b.name) } });
    const existingNames = existing.map(e => e.name);
    const toInsert = brands.filter(b => !existingNames.includes(b.name));
    
    if (toInsert.length > 0) {
      await Brand.insertMany(toInsert);
      console.log('Successfully inserted', toInsert.length, 'brands');
    } else {
      console.log('Brands already exist in DB');
    }
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
