import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image } from 'react-native';
import {
  NativeAdView,
  NativeAd,
  NativeAsset,
  NativeAssetType,
  NativeMediaView,
  TestIds,
} from 'react-native-google-mobile-ads';
import { AD_UNITS } from '../constants/adUnits';
import { useTheme } from '../theme/ThemeProvider';
import AdFreeService from '../services/AdFreeService';

interface Props {
  unitId?: string;
}

const NativeAdBanner = ({ unitId = AD_UNITS.nativeAdvanced }: Props) => {
  const t = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [nativeAd, setNativeAd] = useState<NativeAd | null>(null);

  useEffect(() => {
    let adInstance: NativeAd | null = null;

    const loadAd = async () => {
      try {
        const id = __DEV__ ? TestIds.NATIVE : unitId;
        adInstance = await NativeAd.createForAdRequest(id);
        setNativeAd(adInstance);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load native ad:', err);
        setError(true);
        setLoading(false);
      }
    };

    loadAd();

    return () => {
      if (adInstance) {
        adInstance.destroy();
      }
    };
  }, [unitId]);

  if (AdFreeService.isAdSuppressed() || error) return null;

  if (loading || !nativeAd) {
    return (
      <View style={[styles.outerContainer, styles.loadingContainer, { backgroundColor: t.colors.surface, borderRadius: t.radius.lg }]}>
        <ActivityIndicator size="small" color={t.colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.outerContainer, { backgroundColor: t.colors.surface, borderRadius: t.radius.lg }, t.shadow.sm]}>
      <NativeAdView nativeAd={nativeAd} style={styles.nativeAdView}>
        <View style={styles.content}>
          <View style={styles.header}>
            {nativeAd.icon && (
              <NativeAsset assetType={NativeAssetType.ICON}>
                <Image source={{ uri: nativeAd.icon.url }} style={styles.icon} />
              </NativeAsset>
            )}
            <View style={styles.headerText}>
              <NativeAsset assetType={NativeAssetType.HEADLINE}>
                <Text style={[t.typography.headline, { color: t.colors.label, fontFamily: t.fontFamily }]}>
                  {nativeAd.headline}
                </Text>
              </NativeAsset>
              {nativeAd.advertiser && (
                <NativeAsset assetType={NativeAssetType.ADVERTISER}>
                  <Text style={[t.typography.caption1, { color: t.colors.labelSecondary, fontFamily: t.fontFamily }]}>
                    {nativeAd.advertiser}
                  </Text>
                </NativeAsset>
              )}
            </View>
          </View>

          <NativeAsset assetType={NativeAssetType.BODY}>
            <Text
              style={[t.typography.callout, { color: t.colors.labelSecondary, marginTop: 8, fontFamily: t.fontFamily }]}
              numberOfLines={3}
            >
              {nativeAd.body}
            </Text>
          </NativeAsset>

          {nativeAd.mediaContent && (
            <NativeMediaView style={styles.mediaView} />
          )}

          <NativeAsset assetType={NativeAssetType.CALL_TO_ACTION}>
            <View
              style={[
                styles.cta,
                {
                  backgroundColor: t.colors.primary,
                  borderRadius: t.radius.md,
                },
              ]}
            >
              <Text style={[t.typography.subheadline, { color: '#FFFFFF', fontWeight: 'bold', fontFamily: t.fontFamily }]}>
                {nativeAd.callToAction}
              </Text>
            </View>
          </NativeAsset>
        </View>
      </NativeAdView>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    marginVertical: 10,
    width: '100%',
    overflow: 'hidden',
  },
  loadingContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nativeAdView: {
    width: '100%',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  mediaView: {
    width: '100%',
    height: 180,
    marginTop: 12,
    borderRadius: 8,
  },
  cta: {
    marginTop: 16,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default NativeAdBanner;
