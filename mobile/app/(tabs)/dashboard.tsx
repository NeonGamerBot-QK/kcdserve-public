import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TopBar from '../../components/TopBar';
import OrgCard from '../../components/OrgCard';

export default function DashboardScreen() {
  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView className="flex-1">
        <TopBar initial="J" />

        {/* Stats hero */}
        <View className="items-center mt-4 mb-5">
          <Text className="font-inter-medium text-sm uppercase tracking-wider text-slate-500 mb-1">
            TOTAL APPROVED
          </Text>
          <Text className="font-inter-semibold text-6xl text-slate-900 mt-1.5">
            42.5
          </Text>
          <Text className="font-inter text-base text-slate-500 mt-1">
            Hours completed this year
          </Text>
        </View>

        {/* Pending pill */}
        <View className="items-center mb-8">
          <View className="flex-row items-center bg-white rounded-2xl px-5 py-4 border border-gray-200">
            <View className="w-2 h-2 rounded-full bg-status-pending mr-2" />
            <Text className="font-inter-medium text-sm text-slate-900">
              8.0 Pending
            </Text>
          </View>
        </View>

        {/* Suborganizations */}
        <View className="px-5">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="font-inter-semibold text-sm uppercase tracking-wider text-slate-500">
              SUBORGANIZATIONS
            </Text>
            <Pressable>
              <Text className="font-inter-medium text-sm text-primary-500">
                View all
              </Text>
            </Pressable>
          </View>

          <OrgCard
            name="National Honor Society"
            deadline="Due Jun 1"
            current={18}
            total={25}
          />
          <OrgCard
            name="Key Club"
            deadline="Due May 15"
            current={12.5}
            total={20}
          />
          <OrgCard
            name="Student Council"
            deadline="Due Jun 30"
            current={12}
            total={15}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
