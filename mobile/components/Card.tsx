import { View } from 'react-native';

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export default function Card({ children, className = '' }: CardProps) {
  return (
    <View
      className={`bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 p-4 ${className}`}
    >
      {children}
    </View>
  );
}
