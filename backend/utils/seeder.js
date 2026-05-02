const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Order = require('../models/Order');

dotenv.config({ path: '../.env' });

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected for seeding...');
};

const categories = [
  { name: 'Men Shirts',    slug: 'men-shirts',    type: 'clothes',     gender: 'men',    description: 'Casual and formal shirts for men' },
  { name: 'Men Pants',     slug: 'men-pants',     type: 'clothes',     gender: 'men',    description: 'Jeans and trousers for men' },
  { name: 'Men Shoes',     slug: 'men-shoes',     type: 'shoes',       gender: 'men',    description: 'Sneakers, boots and formal shoes for men' },
  { name: 'Women Dresses', slug: 'women-dresses', type: 'clothes',     gender: 'women',  description: 'Elegant dresses for all occasions' },
  { name: 'Women Tops',    slug: 'women-tops',    type: 'clothes',     gender: 'women',  description: 'Stylish tops and blouses for women' },
  { name: 'Women Shoes',   slug: 'women-shoes',   type: 'shoes',       gender: 'women',  description: 'Heels, flats and sneakers for women' },
  { name: 'Kids Clothes',  slug: 'kids-clothes',  type: 'clothes',     gender: 'kids',   description: 'Comfortable clothes for kids' },
  { name: 'Kids Shoes',    slug: 'kids-shoes',    type: 'shoes',       gender: 'kids',   description: 'Cute and durable shoes for kids' },
  { name: 'Accessories',   slug: 'accessories',   type: 'accessories', gender: 'unisex', description: 'Bags, belts, watches and more' },
  { name: 'Sunglasses',    slug: 'sunglasses',    type: 'accessories', gender: 'unisex', description: 'UV-protected sunglasses' },
];

const users = [
  { name: 'Admin Achraf', email: 'admin@achrafshop.com', password: 'admin123',   role: 'admin' },
  { name: 'John Doe',     email: 'john@example.com',     password: 'password123', role: 'user' },
  { name: 'Jane Smith',   email: 'jane@example.com',     password: 'password123', role: 'user' },
];

const p = (o) => o; // identity helper for readability

const generateProducts = (c) => [
  // ── MEN SHIRTS ──
  p({ name:'Classic Oxford Button-Down Shirt', description:'Timeless Oxford shirt in premium 100% cotton. Button-down collar, chest pocket, adjustable cuffs.', price:59.99, discountPrice:44.99, category:c['Men Shirts'], gender:'men', type:'clothes', images:[{url:'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600'},{url:'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600'}], sizes:['XS','S','M','L','XL','XXL'], colors:['White','Blue','Navy','Grey'], stock:85, brand:'AchrafClassics', tags:['shirt','cotton','oxford'], isFeatured:true, rating:4.5, numReviews:128 }),
  p({ name:'Slim Fit Linen Shirt', description:'Breathable linen shirt for warm weather. Slim fit, button-front, roll-up sleeves.', price:49.99, discountPrice:35.99, category:c['Men Shirts'], gender:'men', type:'clothes', images:[{url:'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600'}], sizes:['S','M','L','XL','XXL'], colors:['White','Beige','Sky Blue','Olive'], stock:70, brand:'SummerLine', tags:['linen','slim','summer'], isFeatured:false, rating:4.3, numReviews:67 }),
  p({ name:'Flannel Plaid Shirt', description:'Cozy flannel shirt with classic plaid pattern. Relaxed fit, two chest pockets.', price:54.99, discountPrice:0, category:c['Men Shirts'], gender:'men', type:'clothes', images:[{url:'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=600'}], sizes:['S','M','L','XL','XXL'], colors:['Red/Black','Blue/Grey','Green/Brown'], stock:55, brand:'RusticWear', tags:['flannel','plaid','casual'], isFeatured:false, rating:4.2, numReviews:45 }),
  p({ name:'Mandarin Collar Dress Shirt', description:'Elegant mandarin collar shirt in premium poplin. Slim fit with French cuffs.', price:79.99, discountPrice:64.99, category:c['Men Shirts'], gender:'men', type:'clothes', images:[{url:'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600'}], sizes:['S','M','L','XL'], colors:['White','Black','Champagne'], stock:40, brand:'EliteWear', tags:['dress shirt','formal','mandarin'], isFeatured:true, rating:4.6, numReviews:82 }),
  // ── MEN PANTS ──
  p({ name:'Slim Fit Chino Pants', description:'Modern slim-fit chinos in stretch cotton blend. Flat-front with side and back pockets.', price:74.99, discountPrice:0, category:c['Men Pants'], gender:'men', type:'clothes', images:[{url:'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600'}], sizes:['28','30','32','34','36','38'], colors:['Beige','Navy','Olive','Black'], stock:60, brand:'UrbanStyle', tags:['chino','slim','stretch'], isFeatured:true, rating:4.3, numReviews:89 }),
  p({ name:'Classic Straight Jeans', description:'Premium denim jeans in classic straight cut. Mid-rise, five-pocket design.', price:89.99, discountPrice:69.99, category:c['Men Pants'], gender:'men', type:'clothes', images:[{url:'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600'}], sizes:['28','30','32','34','36'], colors:['Indigo','Black','Stone Wash'], stock:75, brand:'DenimCo', tags:['jeans','denim','classic'], isFeatured:false, rating:4.4, numReviews:113 }),
  p({ name:'Jogger Sweatpants', description:'Comfortable tapered joggers with elastic waistband. Soft French terry, side pockets.', price:44.99, discountPrice:34.99, category:c['Men Pants'], gender:'men', type:'clothes', images:[{url:'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600'}], sizes:['S','M','L','XL','XXL'], colors:['Charcoal','Navy','Heather Grey'], stock:90, brand:'SportLife', tags:['jogger','sweatpants','comfort'], isFeatured:false, rating:4.2, numReviews:58 }),
  p({ name:'Tailored Wool Trousers', description:'Sophisticated wool-blend trousers with tailored fit. Flat-front, belt loops.', price:119.99, discountPrice:94.99, category:c['Men Pants'], gender:'men', type:'clothes', images:[{url:'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600'}], sizes:['28','30','32','34','36'], colors:['Charcoal','Navy','Black'], stock:35, brand:'EliteWear', tags:['trousers','wool','tailored'], isFeatured:false, rating:4.5, numReviews:41 }),
  // ── MEN SHOES ──
  p({ name:'Premium Leather Derby Shoes', description:'Handcrafted full-grain leather derby shoes. Cushioned insole, rubber sole.', price:149.99, discountPrice:119.99, category:c['Men Shoes'], gender:'men', type:'shoes', images:[{url:'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=600'}], sizes:['40','41','42','43','44','45'], colors:['Brown','Black','Tan'], stock:45, brand:'LuxStep', tags:['leather','derby','formal'], isFeatured:true, rating:4.7, numReviews:203 }),
  p({ name:'Air Comfort Running Sneakers', description:'High-performance sneakers with air cushion. Breathable mesh, reinforced heel.', price:119.99, discountPrice:89.99, category:c['Men Shoes'], gender:'men', type:'shoes', images:[{url:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600'}], sizes:['40','41','42','43','44','45','46'], colors:['White/Red','Black/Blue','Grey/Orange'], stock:120, brand:'SpeedRun', tags:['sneakers','running','sport'], isFeatured:true, rating:4.6, numReviews:312 }),
  p({ name:'Chelsea Boots', description:'Sleek leather Chelsea boots with elastic side panels. Stacked heel, pull tabs.', price:169.99, discountPrice:139.99, category:c['Men Shoes'], gender:'men', type:'shoes', images:[{url:'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=600'}], sizes:['40','41','42','43','44','45'], colors:['Black','Brown','Tan'], stock:38, brand:'LuxStep', tags:['boots','chelsea','leather'], isFeatured:true, rating:4.8, numReviews:156 }),
  p({ name:'Canvas Slip-On Shoes', description:'Lightweight canvas slip-ons with elastic gore. Padded collar, flexible rubber sole.', price:39.99, discountPrice:0, category:c['Men Shoes'], gender:'men', type:'shoes', images:[{url:'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600'}], sizes:['40','41','42','43','44','45'], colors:['White','Navy','Black','Olive'], stock:100, brand:'EasyWalk', tags:['canvas','slip-on','casual'], isFeatured:false, rating:4.1, numReviews:77 }),
  p({ name:'Leather Loafers', description:'Classic penny loafers in smooth genuine leather. Moccasin stitching, leather lining.', price:129.99, discountPrice:104.99, category:c['Men Shoes'], gender:'men', type:'shoes', images:[{url:'https://images.unsplash.com/photo-1531310197839-ccf54634509e?w=600'}], sizes:['40','41','42','43','44','45'], colors:['Brown','Black','Burgundy'], stock:42, brand:'LuxStep', tags:['loafers','leather','classic'], isFeatured:false, rating:4.5, numReviews:92 }),
  // ── WOMEN DRESSES ──
  p({ name:'Floral Wrap Midi Dress', description:'Elegant wrap-style midi dress with floral print. V-neckline, adjustable waist tie.', price:89.99, discountPrice:69.99, category:c['Women Dresses'], gender:'women', type:'clothes', images:[{url:'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600'}], sizes:['XS','S','M','L','XL'], colors:['Floral Blue','Floral Pink','Floral Green'], stock:70, brand:'BloomStyle', tags:['dress','floral','wrap','midi'], isFeatured:true, rating:4.8, numReviews:254 }),
  p({ name:'Little Black Dress', description:'Timeless fitted LBD in premium crepe. Square neckline, short sleeves, knee-length.', price:99.99, discountPrice:79.99, category:c['Women Dresses'], gender:'women', type:'clothes', images:[{url:'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=600'}], sizes:['XS','S','M','L','XL'], colors:['Black'], stock:65, brand:'ClassiqueMode', tags:['dress','black','classic','evening'], isFeatured:true, rating:4.7, numReviews:198 }),
  p({ name:'Boho Maxi Sundress', description:'Flowing boho maxi dress with spaghetti straps. Lightweight rayon, smocked bodice.', price:74.99, discountPrice:59.99, category:c['Women Dresses'], gender:'women', type:'clothes', images:[{url:'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600'}], sizes:['XS','S','M','L','XL'], colors:['Terracotta','Sage Green','Dusty Rose'], stock:55, brand:'BohoChic', tags:['maxi','boho','sundress','summer'], isFeatured:false, rating:4.6, numReviews:132 }),
  p({ name:'Bodycon Bandage Dress', description:'Flattering bodycon dress in stretchy knit. Off-shoulder neckline, knee-length.', price:69.99, discountPrice:54.99, category:c['Women Dresses'], gender:'women', type:'clothes', images:[{url:'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600'}], sizes:['XS','S','M','L'], colors:['Black','Red','Cobalt Blue'], stock:50, brand:'NightOut', tags:['bodycon','party'], isFeatured:false, rating:4.4, numReviews:89 }),
  // ── WOMEN TOPS ──
  p({ name:'Linen Blazer with Gold Buttons', description:'Sophisticated linen blazer with gold-tone buttons. Fully lined, two front pockets.', price:129.99, discountPrice:0, category:c['Women Tops'], gender:'women', type:'clothes', images:[{url:'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600'}], sizes:['XS','S','M','L','XL'], colors:['Cream','Black','Navy'], stock:40, brand:'EliteWear', tags:['blazer','linen','business'], isFeatured:false, rating:4.4, numReviews:98 }),
  p({ name:'Silk Ruffle Blouse', description:'Elegant silk-satin blouse with ruffle detail. V-neckline, relaxed fit.', price:84.99, discountPrice:67.99, category:c['Women Tops'], gender:'women', type:'clothes', images:[{url:'https://images.unsplash.com/photo-1604575408626-c432dd44d43c?w=600'}], sizes:['XS','S','M','L','XL'], colors:['Ivory','Blush','Black','Sage'], stock:45, brand:'SilkLux', tags:['blouse','silk','ruffle'], isFeatured:true, rating:4.6, numReviews:115 }),
  p({ name:'Cropped Knit Sweater', description:'Soft cropped sweater in ribbed knit. Crew neckline, long sleeves.', price:54.99, discountPrice:42.99, category:c['Women Tops'], gender:'women', type:'clothes', images:[{url:'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600'}], sizes:['XS','S','M','L'], colors:['Camel','Dusty Rose','Sage','Ivory'], stock:60, brand:'KnitCo', tags:['sweater','knit','crop'], isFeatured:false, rating:4.5, numReviews:87 }),
  p({ name:'Oversized Graphic Tee', description:'Relaxed oversized tee with artistic print. 100% organic cotton, dropped shoulders.', price:34.99, discountPrice:0, category:c['Women Tops'], gender:'women', type:'clothes', images:[{url:'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600'}], sizes:['XS','S','M','L','XL'], colors:['White','Black','Vintage Wash'], stock:95, brand:'StreetArt', tags:['tee','graphic','oversized'], isFeatured:false, rating:4.3, numReviews:64 }),
  // ── WOMEN SHOES ──
  p({ name:'Strappy Block Heel Sandals', description:'Glamorous strappy sandals with block heel. Adjustable ankle strap, cushioned footbed.', price:99.99, discountPrice:79.99, category:c['Women Shoes'], gender:'women', type:'shoes', images:[{url:'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600'}], sizes:['36','37','38','39','40','41'], colors:['Gold','Silver','Black','Nude'], stock:55, brand:'GlamStep', tags:['sandals','heels','strappy'], isFeatured:true, rating:4.5, numReviews:187 }),
  p({ name:'White Leather Sneakers', description:'Clean minimal white leather sneakers. Perforated detailing, cushioned footbed.', price:89.99, discountPrice:72.99, category:c['Women Shoes'], gender:'women', type:'shoes', images:[{url:'https://images.unsplash.com/photo-1520256862855-398228c41684?w=600'}], sizes:['36','37','38','39','40','41'], colors:['White','White/Gold','White/Pink'], stock:80, brand:'PureStep', tags:['sneakers','white','leather'], isFeatured:true, rating:4.7, numReviews:229 }),
  p({ name:'Suede Ankle Boots', description:'Chic suede ankle boots with side zip and block heel. Padded insole.', price:139.99, discountPrice:109.99, category:c['Women Shoes'], gender:'women', type:'shoes', images:[{url:'https://images.unsplash.com/photo-1548863227-3af567fc3b27?w=600'}], sizes:['36','37','38','39','40'], colors:['Camel','Black','Grey'], stock:35, brand:'GlamStep', tags:['boots','suede','ankle'], isFeatured:false, rating:4.6, numReviews:143 }),
  p({ name:'Espadrille Wedge Sandals', description:'Casual-chic espadrilles with braided jute sole. Ankle strap with buckle.', price:64.99, discountPrice:49.99, category:c['Women Shoes'], gender:'women', type:'shoes', images:[{url:'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600'}], sizes:['36','37','38','39','40','41'], colors:['Natural/White','Navy/White','Black'], stock:60, brand:'EspaChic', tags:['espadrilles','wedge','summer'], isFeatured:false, rating:4.4, numReviews:98 }),
  // ── KIDS ──
  p({ name:'Kids Rainbow Hoodie', description:'Fun colorful hoodie for kids in soft organic cotton. Kangaroo pocket, machine washable.', price:39.99, discountPrice:0, category:c['Kids Clothes'], gender:'kids', type:'clothes', images:[{url:'https://images.unsplash.com/photo-1519278409-1f56fdda7fe5?w=600'}], sizes:['3-4Y','5-6Y','7-8Y','9-10Y','11-12Y'], colors:['Rainbow','Blue','Pink'], stock:90, brand:'KidJoy', tags:['kids','hoodie','rainbow'], isFeatured:false, rating:4.9, numReviews:143 }),
  p({ name:'Boys Denim Shorts', description:'Classic denim shorts for boys. Elastic waistband, two side pockets, reinforced knees.', price:29.99, discountPrice:22.99, category:c['Kids Clothes'], gender:'kids', type:'clothes', images:[{url:'https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=600'}], sizes:['3-4Y','5-6Y','7-8Y','9-10Y','11-12Y'], colors:['Light Wash','Dark Wash'], stock:75, brand:'KidJoy', tags:['kids','denim','shorts'], isFeatured:false, rating:4.3, numReviews:56 }),
  p({ name:'Girls Tutu Dress', description:'Adorable tutu party dress. Glitter bodice, layered tulle skirt, back zip.', price:44.99, discountPrice:34.99, category:c['Kids Clothes'], gender:'kids', type:'clothes', images:[{url:'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=600'}], sizes:['2-3Y','3-4Y','5-6Y','7-8Y'], colors:['Pink','Purple','Mint','Red'], stock:50, brand:'LittlePrincess', tags:['girls','tutu','dress'], isFeatured:true, rating:4.8, numReviews:112 }),
  p({ name:'Kids Puffer Jacket', description:'Warm quilted puffer jacket. Water-resistant shell, fleece lining, front zip.', price:59.99, discountPrice:47.99, category:c['Kids Clothes'], gender:'kids', type:'clothes', images:[{url:'https://images.unsplash.com/photo-1604671801908-6f0c6a092c05?w=600'}], sizes:['3-4Y','5-6Y','7-8Y','9-10Y','11-12Y'], colors:['Navy','Red','Olive','Pink'], stock:65, brand:'KidJoy', tags:['kids','jacket','puffer','winter'], isFeatured:false, rating:4.6, numReviews:78 }),
  p({ name:'Kids Light-Up Sneakers', description:'Fun sneakers with LED lights that light up with every step. Velcro closure.', price:49.99, discountPrice:39.99, category:c['Kids Shoes'], gender:'kids', type:'shoes', images:[{url:'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=600'}], sizes:['20','21','22','23','24','25','26','27','28'], colors:['Blue/Yellow','Pink/Purple','Red/White'], stock:75, brand:'KidJoy', tags:['kids','sneakers','LED'], isFeatured:false, rating:4.8, numReviews:201 }),
  p({ name:'Kids Waterproof Rain Boots', description:'Bright rubber rain boots. Waterproof, easy pull-on tabs, non-slip sole.', price:34.99, discountPrice:0, category:c['Kids Shoes'], gender:'kids', type:'shoes', images:[{url:'https://images.unsplash.com/photo-1603400521630-9f2de124b33b?w=600'}], sizes:['20','21','22','23','24','25','26','27','28'], colors:['Red Dots','Yellow','Navy Stars'], stock:80, brand:'RainKids', tags:['kids','boots','rain'], isFeatured:false, rating:4.7, numReviews:93 }),
  // ── ACCESSORIES ──
  p({ name:'Premium Leather Tote Bag', description:'Spacious leather tote bag. Multiple pockets, magnetic snap, sturdy handles.', price:189.99, discountPrice:149.99, category:c['Accessories'], gender:'unisex', type:'accessories', images:[{url:'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600'}], sizes:['One Size'], colors:['Tan','Black','Brown','Burgundy'], stock:30, brand:'LuxBag', tags:['bag','leather','tote','luxury'], isFeatured:true, rating:4.7, numReviews:167 }),
  p({ name:'Classic Aviator Sunglasses', description:'Iconic aviator sunglasses with UV400 protection. Polarized lenses, metal frame.', price:79.99, discountPrice:59.99, category:c['Sunglasses'], gender:'unisex', type:'accessories', images:[{url:'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600'}], sizes:['One Size'], colors:['Gold/Green','Silver/Grey','Black/Black'], stock:100, brand:'SunVision', tags:['sunglasses','aviator','UV400'], isFeatured:true, rating:4.6, numReviews:289 }),
  p({ name:'Canvas Backpack', description:'Versatile canvas backpack with 15" laptop compartment, padded straps, USB port.', price:69.99, discountPrice:0, category:c['Accessories'], gender:'unisex', type:'accessories', images:[{url:'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600'}], sizes:['One Size'], colors:['Olive','Navy','Black','Grey'], stock:65, brand:'TravelPack', tags:['backpack','canvas','laptop'], isFeatured:false, rating:4.4, numReviews:134 }),
  p({ name:'Minimalist Leather Watch', description:'Slim watch with genuine leather strap. Japanese quartz, sapphire crystal, 30m WR.', price:149.99, discountPrice:119.99, category:c['Accessories'], gender:'unisex', type:'accessories', images:[{url:'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'}], sizes:['One Size'], colors:['Black/Silver','Brown/Gold','Navy/Rose Gold'], stock:40, brand:'TimeCraft', tags:['watch','leather','minimalist'], isFeatured:true, rating:4.8, numReviews:342 }),
  p({ name:'Silk Neck Scarf', description:'Luxurious silk twill scarf with bold pattern. Wear as neck scarf or hair accessory.', price:59.99, discountPrice:44.99, category:c['Accessories'], gender:'unisex', type:'accessories', images:[{url:'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600'}], sizes:['One Size'], colors:['Floral Print','Abstract Blue','Classic Paisley'], stock:55, brand:'SilkLux', tags:['scarf','silk'], isFeatured:false, rating:4.5, numReviews:76 }),
  p({ name:'Genuine Leather Belt', description:'Classic full-grain leather dress belt. Polished buckle, single prong, 1.25" wide.', price:49.99, discountPrice:39.99, category:c['Accessories'], gender:'unisex', type:'accessories', images:[{url:'https://images.unsplash.com/photo-1553803648-93f7e476a3a3?w=600'}], sizes:['30','32','34','36','38','40','42','44'], colors:['Black/Silver','Brown/Gold','Tan/Gold'], stock:70, brand:'LeatherCraft', tags:['belt','leather'], isFeatured:false, rating:4.6, numReviews:103 }),
  p({ name:'Cat-Eye Sunglasses', description:'Retro cat-eye sunglasses. UV400 polarized lenses, acetate frame, spring hinges.', price:64.99, discountPrice:49.99, category:c['Sunglasses'], gender:'women', type:'accessories', images:[{url:'https://images.unsplash.com/photo-1474496397854-7bde96716b43?w=600'}], sizes:['One Size'], colors:['Tortoise','Black','Clear/Gold'], stock:60, brand:'RetroView', tags:['sunglasses','cat-eye','retro'], isFeatured:false, rating:4.5, numReviews:88 }),
  p({ name:'Canvas Weekend Duffel', description:'Large canvas duffel for weekend trips. Shoe compartment, multiple pockets.', price:89.99, discountPrice:69.99, category:c['Accessories'], gender:'unisex', type:'accessories', images:[{url:'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600'}], sizes:['One Size'], colors:['Olive','Navy','Black'], stock:45, brand:'TravelPack', tags:['duffel','bag','travel'], isFeatured:false, rating:4.3, numReviews:61 }),
];

const seedDatabase = async () => {
  try {
    await connectDB();

    await Promise.all([
      User.deleteMany(),
      Product.deleteMany(),
      Category.deleteMany(),
      Order.deleteMany(),
    ]);
    console.log('🗑️  Existing data cleared');

    const createdCategories = await Category.insertMany(categories);
    const categoryMap = {};
    createdCategories.forEach((cat) => { categoryMap[cat.name] = cat._id; });
    console.log(`✅ ${createdCategories.length} categories created`);

    const createdUsers = await User.insertMany(users);
    console.log(`✅ ${createdUsers.length} users created`);
    console.log('   Admin: admin@achrafshop.com / admin123');
    console.log('   User:  john@example.com / password123');

    const productData = generateProducts(categoryMap);
    const createdProducts = await Product.insertMany(productData);
    console.log(`✅ ${createdProducts.length} products created`);

    console.log('\n🎉 Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
