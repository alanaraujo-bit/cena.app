import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Linking, Platform, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { PurchasesPackage } from 'react-native-purchases';
import { AppBackground, GlassCard, GlassSurface, Icon, PrimaryButton, ThemedText, type IconName } from '@/design-system';
import { premiumApi } from '@/features/premium/api';
import { usePremiumStatus } from '@/features/premium/hooks';
import { getMonthlyPackage, isPurchasesAvailable, purchaseMonthly, restorePurchases } from '@/lib/purchases';
import { prismGradient, useTheme } from '@/theme';

const BENEFITS: { icon: IconName; title: string; description: string }[] = [
  {
    icon: 'diamond',
    title: 'Selo Premium',
    description: 'Um selo exclusivo ao lado do seu nome no feed, perfil e ranking.',
  },
  {
    icon: 'star-fill',
    title: 'Molduras exclusivas',
    description: '"Aurora Cinéfila" e "Aurora Noturna" — molduras animadas só de assinantes.',
  },
  {
    icon: 'versus',
    title: 'Filme Versus sem limite',
    description: 'Crie quantos Versus quiser, sem esperar o anterior fechar.',
  },
  {
    icon: 'chart',
    title: 'Sua Jornada Cinéfila',
    description: 'Estatísticas avançadas: gêneros, décadas, diretores favoritos e sua evolução mês a mês.',
  },
];

function manageSubscriptionUrl(): string {
  return Platform.OS === 'ios'
    ? 'itms-apps://apps.apple.com/account/subscriptions'
    : 'https://play.google.com/store/account/subscriptions';
}

export default function PremiumScreen() {
  const theme = useTheme();
  const router = useRouter();
  const status = usePremiumStatus();
  const [pkg, setPkg] = useState<PurchasesPackage | null>(null);
  const [busy, setBusy] = useState(false);
  const available = isPurchasesAvailable();

  useEffect(() => {
    if (!available) return;
    void getMonthlyPackage().then(setPkg);
  }, [available]);

  async function handlePurchase() {
    if (!pkg) return;
    setBusy(true);
    try {
      const info = await purchaseMonthly(pkg);
      if (!info) return; // user cancelled
      await premiumApi.sync({
        active: true,
        productId: pkg.product.identifier,
        expiresAtMs: null,
        willRenew: true,
      });
      await status.refetch();
      router.back();
    } finally {
      setBusy(false);
    }
  }

  async function handleRestore() {
    setBusy(true);
    try {
      const info = await restorePurchases();
      if (info) {
        await premiumApi.sync({ active: true, productId: pkg?.product.identifier, expiresAtMs: null, willRenew: true });
        await status.refetch();
      }
    } finally {
      setBusy(false);
    }
  }

  const isPremium = status.data?.isPremium ?? false;

  return (
    <AppBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 12, paddingTop: 8 }}>
          <Pressable onPress={() => router.back()} hitSlop={10} accessibilityLabel="Voltar">
            <GlassSurface
              elevated
              intensity="strong"
              radius={theme.radii.pill}
              style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
            >
              <Icon name="chevron-left" size={22} color={theme.colors.text.primary} weight="semibold" />
            </GlassSurface>
          </Pressable>
          <ThemedText variant="title">CENA Premium</ThemedText>
        </View>

        <View style={{ padding: theme.spacing.lg, gap: theme.spacing.lg, flex: 1 }}>
          <View style={{ alignItems: 'center', gap: theme.spacing.sm, marginTop: theme.spacing.md }}>
            <GlassSurface
              intensity="strong"
              radius={999}
              style={{ width: 72, height: 72, alignItems: 'center', justifyContent: 'center' }}
            >
              <Icon name="diamond" size={34} color={prismGradient[1]} />
            </GlassSurface>
            <ThemedText variant="title" align="center">
              Vá além com o Premium
            </ThemedText>
            <ThemedText variant="body" color="secondary" align="center">
              Recursos exclusivos para quem leva o cinema a sério.
            </ThemedText>
          </View>

          <View style={{ gap: theme.spacing.md }}>
            {BENEFITS.map((b) => (
              <GlassCard key={b.title}>
                <View style={{ flexDirection: 'row', gap: theme.spacing.md, alignItems: 'flex-start' }}>
                  <Icon name={b.icon} size={22} color={theme.colors.accent.onSurface} />
                  <View style={{ flex: 1 }}>
                    <ThemedText variant="subheadline">{b.title}</ThemedText>
                    <ThemedText variant="caption" color="secondary" style={{ marginTop: 2 }}>
                      {b.description}
                    </ThemedText>
                  </View>
                </View>
              </GlassCard>
            ))}
          </View>

          <View style={{ flex: 1 }} />

          {isPremium ? (
            <View style={{ gap: theme.spacing.sm }}>
              <GlassCard>
                <ThemedText variant="subheadline" align="center">
                  Você já é Premium ✓
                </ThemedText>
                {status.data?.expiresAt ? (
                  <ThemedText variant="caption" color="secondary" align="center" style={{ marginTop: 4 }}>
                    {status.data.willRenew ? 'Renova' : 'Expira'} em{' '}
                    {new Date(status.data.expiresAt).toLocaleDateString('pt-BR')}
                  </ThemedText>
                ) : null}
              </GlassCard>
              <PrimaryButton
                label="Gerenciar assinatura"
                variant="glass"
                onPress={() => void Linking.openURL(manageSubscriptionUrl())}
              />
            </View>
          ) : !available ? (
            <GlassCard>
              <ThemedText variant="caption" color="secondary" align="center">
                As compras só funcionam em um build nativo (EAS dev client) — não no Expo Go. Este ambiente é
                só para preview dos benefícios.
              </ThemedText>
            </GlassCard>
          ) : (
            <View style={{ gap: theme.spacing.sm }}>
              <PrimaryButton
                label={pkg ? `Assinar por ${pkg.product.priceString}/mês` : 'Carregando...'}
                onPress={() => void handlePurchase()}
                loading={busy}
                disabled={!pkg}
              />
              <PrimaryButton label="Restaurar compras" variant="ghost" onPress={() => void handleRestore()} loading={busy} />
              <ThemedText variant="micro" color="tertiary" align="center">
                Renovação automática mensal. Cancele quando quiser nas configurações da loja.
              </ThemedText>
            </View>
          )}
        </View>
      </SafeAreaView>
    </AppBackground>
  );
}
