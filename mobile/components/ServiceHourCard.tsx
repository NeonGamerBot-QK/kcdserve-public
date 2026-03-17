import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import StatusBadge from './StatusBadge';
import Card from './Card';

type ServiceHourCardProps = {
  title: string;
  org: string;
  date: string;
  hours: number;
  status: 'pending' | 'approved' | 'rejected';
  icon?: string;
};

export default function ServiceHourCard({
  title,
  org,
  date,
  hours,
  status,
  icon = 'time-outline',
}: ServiceHourCardProps) {
  return (
    <Card className="flex-row items-center py-3 px-5 mx-5 my-1">
      <View className="w-10 h-10 rounded-full bg-primary-50 items-center justify-center mr-3">
        <Ionicons name={icon as any} size={20} color="#3B82F6" />
      </View>
      <View className="flex-1">
        <Text className="font-inter-medium text-sm text-slate-900">{title}</Text>
        <Text className="font-inter text-xs text-slate-500 mt-0.5">
          {org} · {date}
        </Text>
      </View>
      <View className="items-end">
        <Text className="font-inter-semibold text-sm text-slate-900">
          {hours}h
        </Text>
        <View className="mt-0.5">
          <StatusBadge status={status} />
        </View>
      </View>
    </Card>
  );
}
