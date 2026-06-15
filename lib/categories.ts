export const CONTENT_CATEGORIES = [
  'Fashion',
  'Beauty',
  'Food',
  'Travel',
  'Fitness',
  'Tech',
  'Lifestyle',
  'Gaming',
  'Music',
  'Art',
  'Photography',
  'Comedy',
  'Education',
  'Business',
  'Other',
] as const;

export type ContentCategory = (typeof CONTENT_CATEGORIES)[number];
