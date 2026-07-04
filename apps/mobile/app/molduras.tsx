import { useState } from 'react';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { FrameCatalogItem } from '@cena/shared';
import { AppBackground, GlassCard, GlassSurface, GlassTextField, Icon, PrimaryButton, ThemedText } from '@/design-system';
import { FrameCard } from '@/features/frames/FrameCard';
import { useEquipFrame, useFrames, useGiftFrame } from '@/features/frames/hooks';
import { useTheme } from '@/theme';

export default function MoldurasScreen() {
  const theme = useTheme();
  const router = useRouter();
  const library = useFrames();
  const equip = useEquipFrame();
  const gift = useGiftFrame();
  const [giftingFrame, setGiftingFrame] = useState<FrameCatalogItem | null>(null);
  const [giftUsername, setGiftUsername] = useState('');

  const submitGift = () => {
    const username = giftUsername.trim().toLowerCase();
    if (!giftingFrame || !username) return;
    gift.mutate(
      { frameId: giftingFrame.id, username },
      {
        onSuccess: () => {
          setGiftingFrame(null);
          setGiftUsername('');
        },
      },
    );
  };

  return (
    <AppBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            paddingHorizontal: 12,
            paddingTop: 8,
            paddingBottom: 4,
          }}
        >
          <Pressable onPress={() => router.back()} hitSlop={10} accessibilityLabel="Voltar">
            <GlassSurface elevated intensity="strong" radius={theme.radii.pill} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="chevron-left" size={22} color={theme.colors.text.primary} weight="semibold" />
            </GlassSurface>
          </Pressable>
          <ThemedText variant="title">Molduras</ThemedText>
        </View>

        {library.isLoading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color={theme.colors.accent.onSurface} size="large" />
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: theme.spacing.lg, paddingTop: 0, gap: theme.spacing.md, paddingBottom: 40 }}
          >
            {library.data?.frames.map((frame) => (
              <View key={frame.id}>
                <FrameCard
                  frame={frame}
                  equipping={equip.isPending && equip.variables === frame.id}
                  onEquip={() => equip.mutate(frame.id)}
                  onGift={
                    library.data?.canGift
                      ? () => {
                          setGiftingFrame(frame);
                          setGiftUsername('');
                        }
                      : undefined
                  }
                />
                {giftingFrame?.id === frame.id ? (
                  <GlassCard style={{ marginTop: 8 }}>
                    <ThemedText variant="caption" color="secondary" style={{ marginBottom: theme.spacing.sm }}>
                      Presentear "{frame.name}" para qual @usuário?
                    </ThemedText>
                    <View style={{ flexDirection: 'row', gap: theme.spacing.sm, alignItems: 'flex-end' }}>
                      <View style={{ flex: 1 }}>
                        <GlassTextField
                          placeholder="usuario"
                          value={giftUsername}
                          onChangeText={setGiftUsername}
                          autoCapitalize="none"
                          onSubmitEditing={submitGift}
                        />
                      </View>
                      <PrimaryButton
                        label="Enviar"
                        onPress={submitGift}
                        loading={gift.isPending}
                        fullWidth={false}
                      />
                    </View>
                  </GlassCard>
                ) : null}
              </View>
            ))}
          </ScrollView>
        )}
      </SafeAreaView>
    </AppBackground>
  );
}
