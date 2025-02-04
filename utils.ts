import { MantineColor } from '@mantine/core';
import { locales } from './i18n/routing';

export const alwaysRandomUsernames = (process.env.ALWAYS_RANDOM_USERNAMES ?? 'true') === 'true';

function hashCode(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash;
}

const defaultColors: MantineColor[] = [
  'blue',
  'cyan',
  'grape',
  'green',
  'indigo',
  'lime',
  'orange',
  'pink',
  'red',
  'teal',
  'violet',
];

export function getInitialsColor(name: string, colors: MantineColor[] = defaultColors) {
  const hash = hashCode(name);
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

export function getRandomUserName() {
  const a = ["Small", "Blue", "Ugly", "Crazy", "Fast", "Slow", "Smart", "Dumb", "Funny", "Sad", "Happy", "Angry", "Tall", "Short", "Big", "Little", "Fat", "Skinny", "Old", "Young", "Weak", "Strong", "Loud", "Quiet", "Clean", "Dirty", "Hard", "Soft", "Hot", "Cold", "Wet", "Dry", "Bright", "Dark", "Sweet", "Sour", "Bitter", "Salty", "Good", "Bad", "Right", "Wrong", "New", "Early", "Late", "Light", "Heavy", "Empty", "Full", "Sharp", "Blunt", "Smooth", "Rough", "Thick", "Thin", "Wide", "Narrow", "Near", "Far", "Deep", "Shallow", "High", "Low", "Brave", "Cowardly", "Kind", "Cruel", "Polite", "Rude", "Honest", "Dishonest", "Generous", "Greedy", "Friendly", "Unfriendly", "Clever", "Stupid", "Careful", "Careless", "Lucky", "Unlucky", "Healthy", "Sick", "Safe", "Dangerous", "Comfortable", "Uncomfortable", "Pleasant", "Unpleasant", "Beautiful", "Expensive", "Cheap", "Useful", "Useless", "Interesting", "Boring", "Exciting", "Frightening", "Difficult", "Easy", "Simple", "Complex", "Modern", "Ancient", "Natural", "Artificial", "Normal", "Strange", "Common", "Rare", "Popular", "Unpopular", "Successful", "Unsuccessful", "Possible", "Impossible", "True", "False", "Real", "Imaginary"]
  const b = ["Bear", "Dog", "Banana", "Apple", "Carrot", "Potato", "Tomato", "Cucumber", "Pumpkin", "Strawberry", "Raspberry", "Blueberry", "Blackberry", "Cherry", "Peach", "Plum", "Pear", "Orange", "Lemon", "Lime", "Grapefruit", "Watermelon", "Melon", "Pineapple", "Coconut", "Kiwi", "Mango", "Papaya", "Guava", "Passionfruit", "Lychee", "Durian", "Jackfruit", "Avocado", "Pomegranate", "Fig", "Date", "Olive", "Chestnut", "Hazelnut", "Peanut", "Almond", "Cashew", "Pistachio", "Walnut", "Macadamia", "Pecan", "Brazilnut", "Pine", "Spruce", "Fir", "Cedar", "Cypress", "Juniper", "Yew", "Hemlock", "Larch", "Redwood", "Sequoia", "Birch", "Aspen", "Poplar", "Willow", "Oak", "Beech", "Hornbeam", "Maple", "Ash", "Elm", "Sycamore", "Linden", "Apricot", "Quince", "Medlar", "Loquat", "Persimmon", "Grape", "Currant", "Gooseberry", "Cranberry"]
  const rA = Math.floor(Math.random() * a.length);
  const rB = Math.floor(Math.random() * b.length);
  return a[rA] + b[rB];
}

export function getRandomUserImageURL(seed?: string) {
  seed = seed ?? Math.random().toString(36).substring(7);
  
  return `https://api.dicebear.com/9.x/glass/svg?seed=${seed}`;
}

export function getPathsFromURL(url: string) {
  return new URL(url).pathname.split('/');
}

export function getQueryParamsFromURL(url: string) {
  return new URL(url).searchParams;
}

export function isSupportedLocale(locale: string) {
  return locales.includes(locale);
}