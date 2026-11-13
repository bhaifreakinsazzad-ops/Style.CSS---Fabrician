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
  'prod-01': [
    {
      id: 'rev-01-1',
      productId: 'prod-01',
      author: 'Sazzad S.',
      location: 'Gulshan-2, Dhaka',
      rating: 5,
      date: 'November 2, 2026',
      sizePurchased: '40 / M',
      fitFeedback: 'Runs True to Size',
      title: 'The Giza cotton drape and Jamdani cuffs are unmatched',
      comment: 'Wore this for an evening family event in Gulshan. The hidden placket creates a clean architectural chest profile, and the hand-interlaced geometric Jamdani cuff insets caught everyone’s eye. Fabric breathes effortlessly in Dhaka weather.',
      verifiedBuyer: true,
      helpfulCount: 14,
    },
    {
      id: 'rev-01-2',
      productId: 'prod-01',
      author: 'Mahmudul Hasan',
      location: 'Dhanmondi, Dhaka',
      rating: 5,
      date: 'October 28, 2026',
      sizePurchased: '42 / L',
      fitFeedback: 'Runs True to Size',
      title: 'Finest contemporary menswear out of Bangladesh',
      comment: 'Finally a Panjabi that moves away from gaudy shiny polyester. The mercerized matte cotton has substantial body without being hot. Delivered within 24 hours via Pathao sealed in protective canvas.',
      verifiedBuyer: true,
      helpfulCount: 9,
    },
    {
      id: 'rev-01-3',
      productId: 'prod-01',
      author: 'Fahim Chowdhury',
      location: 'Nasirabad, Chittagong',
      rating: 4,
      date: 'October 15, 2026',
      sizePurchased: '40 / M',
      fitFeedback: 'Slightly Relaxed',
      title: 'Superb craftsmanship, collar is extremely sharp',
      comment: 'The mandarin collar holds its structure perfectly through an entire 8-hour wedding reception. Highly recommend taking your exact chest measurement using their Bangladeshi fit chart.',
      verifiedBuyer: true,
      helpfulCount: 6,
    },
  ],
  'prod-02': [
    {
      id: 'rev-02-1',
      productId: 'prod-02',
      author: 'Nusrat Jahan',
      location: 'Banani, Dhaka',
      rating: 5,
      date: 'November 5, 2026',
      sizePurchased: 'Free Size',
      fitFeedback: 'Runs True to Size',
      title: 'Architectural drape with pure gold zari filament',
      comment: 'Unlike machine copies, this Jamdani Mulmul breathes like second skin. The structural waist tucks give it a deconstructed high-fashion silhouette without losing royal Bengali heritage.',
      verifiedBuyer: true,
      helpfulCount: 19,
    },
    {
      id: 'rev-02-2',
      productId: 'prod-02',
      author: 'Farhana Rahman',
      location: 'Uttara, Dhaka',
      rating: 5,
      date: 'October 22, 2026',
      sizePurchased: 'Free Size',
      fitFeedback: 'Runs True to Size',
      title: 'Heirloom quality packaging & express doorstep delivery',
      comment: 'Packed in a custom matte debossed storage box. The contrast between deep obsidian black and antique gold thread is pure luxury in person.',
      verifiedBuyer: true,
      helpfulCount: 11,
    },
  ],
  'prod-03': [
    {
      id: 'rev-03-1',
      productId: 'prod-03',
      author: 'Rafid Al-Hasan',
      location: 'Dhanmondi, Dhaka',
      rating: 5,
      date: 'November 4, 2026',
      sizePurchased: 'L',
      fitFeedback: 'Slightly Relaxed',
      title: '480 GSM is genuinely heavy and architectural',
      comment: 'The loopback fleece is so dense that the hood stays upright when worn up. Doesn’t droop or pill after two machine washes. Worth every single taka.',
      verifiedBuyer: true,
      helpfulCount: 22,
    },
    {
      id: 'rev-03-2',
      productId: 'prod-03',
      author: 'Zubair K.',
      location: 'Sylhet Sadar',
      rating: 5,
      date: 'October 30, 2026',
      sizePurchased: 'XL',
      fitFeedback: 'Runs True to Size',
      title: 'Top tier boxy fit',
      comment: 'Substantial drop shoulders and deep kangaroo pouch. Fits like high-end Japanese archive wear.',
      verifiedBuyer: true,
      helpfulCount: 7,
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
      sizePurchased: 'M',
      fitFeedback: 'Runs True to Size',
      title: 'Exceptional tailoring & tactile luxury',
      comment: 'Exceeded my expectations in both seam finishing and fabric feel. Fabrician is setting a new standard for Made in Bangladesh luxury.',
      verifiedBuyer: true,
      helpfulCount: 12,
    },
    {
      id: 'rev-def-2',
      productId: 'default',
      author: 'Samira Anis',
      location: 'Baridhara DOHS, Dhaka',
      rating: 5,
      date: 'October 25, 2026',
      sizePurchased: 'M',
      fitFeedback: 'Runs True to Size',
      title: 'Impeccable cut and color fidelity',
      comment: 'Matches the 3D try-on rendering exactly in real daylight. The fabric has an elegant weight and soft hand-feel.',
      verifiedBuyer: true,
      helpfulCount: 8,
    },
  ],
};
