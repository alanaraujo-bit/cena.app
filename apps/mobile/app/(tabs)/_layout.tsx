import { Tabs, useRouter } from 'expo-router';
import { GlassTabBar } from '@/design-system';

export default function TabsLayout() {
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <GlassTabBar {...props} onLogPress={() => router.push('/log')} />}
    >
      <Tabs.Screen name="index" options={{ title: 'Feed' }} />
      <Tabs.Screen name="buscar" options={{ title: 'Buscar' }} />
      <Tabs.Screen name="ranking" options={{ title: 'Ranking' }} />
      <Tabs.Screen name="perfil" options={{ title: 'Perfil' }} />
    </Tabs>
  );
}
