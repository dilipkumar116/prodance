import { motion } from 'framer-motion';
import { HiPlus } from '../../utils/icons';

export default function FAB({ onClick }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.05 }}
      className="fixed bottom-24 right-5 z-40 w-14 h-14 rounded-full
                 bg-accent-green text-primary flex items-center justify-center
                 shadow-glow-green hover:shadow-lg transition-shadow duration-200"
    >
      <HiPlus className="w-7 h-7" />
    </motion.button>
  );
}
