import { HiShoppingBag, HiTruck, HiFilm, HiLightningBolt, HiHome, HiDotsHorizontal, HiHeart, HiAcademicCap, HiCash, HiVideoCamera, HiUsers, HiPopcorn, HiX } from './icons';
import { IoFastFood, IoGameController } from './icons';
import { MdHealthAndSafety, MdRestaurant } from './icons';

export const DEFAULT_CATEGORIES = [
  { id: 'food', name: 'Food', icon: 'MdRestaurant', color: '#05E099' }, // Vibrant Mint
  { id: 'snacks', name: 'Snacks', icon: 'HiPopcorn', color: '#FFD166' }, // Golden Peach
  { id: 'x', name: 'X', icon: 'HiX', color: '#FF3366' }, // Neon Crimson
  { id: 'friends', name: 'Friends', icon: 'HiUsers', color: '#00C2FF' }, // Electric Cyan
  { id: 'family', name: 'Family', icon: 'HiHome', color: '#FF007F' }, // Sunset Pink
  { id: 'entertainment', name: 'Entertainment', icon: 'HiVideoCamera', color: '#BB86FC' }, // Amethyst
  { id: 'others', name: 'Others', icon: 'HiDotsHorizontal', color: '#A0AAB2' }, // Sleek Silver
];

export const CATEGORY_ICONS = {
  MdRestaurant,
  HiPopcorn,
  HiX,
  HiUsers,
  HiVideoCamera,
  IoFastFood,
  HiTruck,
  HiShoppingBag,
  HiFilm,
  HiLightningBolt,
  HiHome,
  HiDotsHorizontal,
  HiHeart,
  HiAcademicCap,
  HiCash,
  IoGameController,
  MdHealthAndSafety,
};

export const getCategoryIcon = (iconName) => {
  return CATEGORY_ICONS[iconName] || HiDotsHorizontal;
};

export const getCategoryById = (categories, id) => {
  return categories.find(c => c.id === id) || DEFAULT_CATEGORIES[DEFAULT_CATEGORIES.length - 1];
};

export const TASK_COLORS = [
  { id: 'olive', bg: '#2D3B2D', name: 'Olive' },
  { id: 'brown', bg: '#3B2D2D', name: 'Brown' },
  { id: 'charcoal', bg: '#1E1E2E', name: 'Charcoal' },
  { id: 'dark', bg: '#1A1A2E', name: 'Navy' },
  { id: 'teal', bg: '#1A2E2E', name: 'Teal' },
  { id: 'purple', bg: '#2D1A3B', name: 'Purple' },
  { id: 'gray', bg: '#1E1E1E', name: 'Gray' },
];

export const FILTER_OPTIONS = [
  'Today',
  'Last Week',
  'Last Month',
  'Last Year',
  'Overall',
];
