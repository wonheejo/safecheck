import {useState, useEffect, useCallback, useRef} from 'react';
import {Platform} from 'react-native';
import {
  initConnection,
  endConnection,
  getSubscriptions,
  getAvailablePurchases,
  requestSubscription,
  purchaseUpdatedListener,
  purchaseErrorListener,
  finishTransaction,
  type ProductPurchase,
  type SubscriptionPurchase,
  type PurchaseError,
} from 'react-native-iap';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PRODUCT_ID = 'io.safecheck.app.monthly';
const SUBSCRIPTION_CACHE_KEY = '@subscription_active';

export const useSubscription = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const purchaseUpdateSubscription = useRef<ReturnType<typeof purchaseUpdatedListener> | null>(null);
  const purchaseErrorSubscription = useRef<ReturnType<typeof purchaseErrorListener> | null>(null);

  // Load cached status for instant UI
  const loadCachedStatus = useCallback(async () => {
    try {
      const cached = await AsyncStorage.getItem(SUBSCRIPTION_CACHE_KEY);
      if (cached === 'true') {
        setIsSubscribed(true);
      }
    } catch {}
  }, []);

  const cacheStatus = useCallback(async (active: boolean) => {
    try {
      await AsyncStorage.setItem(SUBSCRIPTION_CACHE_KEY, active ? 'true' : 'false');
    } catch {}
  }, []);

  const checkSubscription = useCallback(async () => {
    try {
      const purchases = await getAvailablePurchases();
      const hasActive = purchases.some(
        (p) => p.productId === PRODUCT_ID,
      );
      setIsSubscribed(hasActive);
      await cacheStatus(hasActive);
    } catch (e: any) {
      console.warn('Failed to check subscription:', e.message);
    }
  }, [cacheStatus]);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      await loadCachedStatus();

      try {
        await initConnection();

        // Fetch subscription product to confirm it exists
        const skus = Platform.select({
          ios: [PRODUCT_ID],
          android: [PRODUCT_ID],
        }) || [PRODUCT_ID];
        await getSubscriptions({skus});

        // Check for active subscriptions
        await checkSubscription();
      } catch (e: any) {
        console.warn('IAP init error:', e.message);
        if (mounted) {
          setError(e.message);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Listen for purchase updates
    purchaseUpdateSubscription.current = purchaseUpdatedListener(
      async (purchase: SubscriptionPurchase | ProductPurchase) => {
        if (purchase.productId === PRODUCT_ID) {
          await finishTransaction({purchase, isConsumable: false});
          setIsSubscribed(true);
          await cacheStatus(true);
        }
      },
    );

    purchaseErrorSubscription.current = purchaseErrorListener(
      (e: PurchaseError) => {
        if (e.code !== 'E_USER_CANCELLED') {
          setError(e.message);
        }
      },
    );

    init();

    return () => {
      mounted = false;
      purchaseUpdateSubscription.current?.remove();
      purchaseErrorSubscription.current?.remove();
      endConnection();
    };
  }, [loadCachedStatus, checkSubscription, cacheStatus]);

  const purchase = useCallback(async () => {
    setError(null);
    try {
      await requestSubscription({sku: PRODUCT_ID});
    } catch (e: any) {
      if (e.code !== 'E_USER_CANCELLED') {
        setError(e.message || 'Purchase failed');
      }
    }
  }, []);

  const restore = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      await checkSubscription();
    } catch (e: any) {
      setError(e.message || 'Restore failed');
    } finally {
      setIsLoading(false);
    }
  }, [checkSubscription]);

  return {isSubscribed, isLoading, error, purchase, restore};
};
