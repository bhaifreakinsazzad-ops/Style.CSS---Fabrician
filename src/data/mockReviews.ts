export interface ReviewItem {
  id: string;
  productId: string;
  author: string;
  location: string;
  rating: number; // 1 to 5
  date: string;
  sizePurchased: string;
  fitFeedback: 'Runs True to Size' | 'Slightly Relaxed' | 'Tailored & Snug';
  title: string;
  comment: string;
  verifiedBuyer: boolean;
  helpfulCount: number;
}

export const INITIAL_REVIEWS: Record<string, ReviewItem[]> = {
  'FAB-H003': [
    {
      id: 'rev-h003-1',
      productId: 'FAB-H003',
      author: 'Sazzad S.',
      location: 'Gulshan-2, Dhaka',
      rating: 5,
      date: 'November 2, 2026',
      sizePurchased: 'L',
      fitFeedback: 'Runs True to Size',
      title: 'Folk Art Bus print is vibrant and the fleece feels substantial',
      comment:
        'Picked up Folk Art Bus after seeing the campaign shots. The 330–350 GSM one-side brushed fleece holds shoulder structure nicely without overheating indoors, and the bus typography artwork is crisp.',
      verifiedBuyer: true,
      helpfulCount: 14,
    },
    {
      id: 'rev-h003-2',
      productId: 'FAB-H003',
      author: 'Mahmudul Hasan',
      location: 'Dhanmondi, Dhaka',
      rating: 5,
      date: 'October 28, 2026',
      sizePurchased: 'XL',
      fitFeedback: 'Slightly Relaxed',
      title: 'Standout Bangladeshi streetwear identity',
      comment:
        'Comfortable brushed interior with clean seams around the hood and cuffs. Delivered within 24 hours via Pathao Courier in Dhaka.',
      verifiedBuyer: true,
      helpfulCount: 9,
    },
  ],
  'FAB-H007': [
    {
      id: 'rev-h007-1',
      productId: 'FAB-H007',
      author: 'Rafid Al-Hasan',
      location: 'Dhanmondi, Dhaka',
      rating: 5,
      date: 'November 4, 2026',
      sizePurchased: 'L',
      fitFeedback: 'Slightly Relaxed',
      title: 'Rich Chocolate Brown tone and clean Old Dhaka artwork',
      comment:
        'The Chocolate Brown shade looks deep and rich in daylight, and the graphic wash blends well into the fleece. Zero shrinkage after gentle cold wash.',
      verifiedBuyer: true,
      helpfulCount: 17,
    },
    {
      id: 'rev-h007-2',
      productId: 'FAB-H007',
      author: 'Zubair K.',
      location: 'Sylhet Sadar',
      rating: 5,
      date: 'October 30, 2026',
      sizePurchased: 'M',
      fitFeedback: 'Runs True to Size',
      title: 'Top tier everyday hoodie',
      comment:
        'Relaxed drop shoulders and reliable winter warmth. Paired another hoodie for the ৳150 bundle discount and free shipping.',
      verifiedBuyer: true,
      helpfulCount: 7,
    },
  ],
  'tp-cat-001': [
    {
      id: 'rev-cat001-1',
      productId: 'tp-cat-001',
      author: 'Nusrat Jahan',
      location: 'Banani, Dhaka',
      rating: 5,
      date: 'November 5, 2026',
      sizePurchased: 'Unstitched Set',
      fitFeedback: 'Runs True to Size',
      title: 'Crisp plum floral print and soft tassel dupatta',
      comment:
        'The flat-lay photo matched the fabric 100%. The fuchsia salwar cloth pairs beautifully with the plum paisley kameez yardage, and the tasseled cotton dupatta drapes effortlessly.',
      verifiedBuyer: true,
      helpfulCount: 19,
    },
  ],
  'tp-fs-01': [
    {
      id: 'rev-fs01-1',
      productId: 'tp-fs-01',
      author: 'Farhana Rahman',
      location: 'Uttara, Dhaka',
      rating: 5,
      date: 'October 22, 2026',
      sizePurchased: 'Unstitched Set',
      fitFeedback: 'Runs True to Size',
      title: 'Mirror-work diamond embroidery looks luminous in person',
      comment:
        'Ordered FS-D01 for a family dawat. The golden mustard lawn pairs with the burgundy printed salwar seamlessly, and stitch alignment around the neckline was super easy for my tailor.',
      verifiedBuyer: true,
      helpfulCount: 11,
    },
  ],
  'tp-zsl-01': [
    {
      id: 'rev-zsl01-1',
      productId: 'tp-zsl-01',
      author: 'Samira Anis',
      location: 'Baridhara DOHS, Dhaka',
      rating: 5,
      date: 'October 25, 2026',
      sizePurchased: 'Unstitched Set',
      fitFeedback: 'Runs True to Size',
      title: 'Breathable Swiss lawn & vivid contrast dupatta',
      comment:
        'ZSL-01 stays airy through Dhaka afternoons. The gold-ochre floral dupatta adds an instant festive contrast over the navy paisley panel.',
      verifiedBuyer: true,
      helpfulCount: 10,
    },
  ],
  'default': [
    {
      id: 'rev-def-1',
      productId: 'default',
      author: 'Tanvir Ahmed',
      location: 'Gulshan-1, Dhaka',
      rating: 5,
      date: 'November 1, 2026',
      sizePurchased: 'L',
      fitFeedback: 'Runs True to Size',
      title: 'Reliable fabric weight & faithful catalog colors',
      comment:
        'Both StarKiT hoodies and Fariza’s Territory sets match the catalog specifications accurately. Fast Pathao delivery and neat protective packaging.',
      verifiedBuyer: true,
      helpfulCount: 12,
    },
    {
      id: 'rev-def-2',
      productId: 'default',
      author: 'Tahmina Karim',
      location: 'Nasirabad, Chattogram',
      rating: 5,
      date: 'October 26, 2026',
      sizePurchased: 'M',
      fitFeedback: 'Runs True to Size',
      title: 'Zero-guesswork flat-lay & drape inspection',
      comment:
        'Having both the flat-lay textile view and model drape preview made selecting our three-piece ensembles straightforward.',
      verifiedBuyer: true,
      helpfulCount: 8,
    },
  ],
};
