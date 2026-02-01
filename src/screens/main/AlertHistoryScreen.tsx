import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  RefreshControl,
} from 'react-native';
import {useAuth} from '../../hooks/useAuth';
import {getAlertHistory} from '../../api/supabase';
import type {AlertLog} from '../../types';

export const AlertHistoryScreen: React.FC = () => {
  const {authUser} = useAuth();
  const [alerts, setAlerts] = useState<AlertLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAlerts = useCallback(async () => {
    if (!authUser?.id) {
      return;
    }

    try {
      const {data, error} = await getAlertHistory(authUser.id);
      if (!error && data) {
        setAlerts(data);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [authUser?.id]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAlerts();
  }, [fetchAlerts]);

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getAlertTypeInfo = (type: AlertLog['alert_type']) => {
    switch (type) {
      case 'warning':
        return {
          label: 'Warning Sent',
          color: '#F59E0B',
          bgColor: '#FEF3C7',
        };
      case 'sms_alert':
        return {
          label: 'SMS Alert',
          color: '#EF4444',
          bgColor: '#FEE2E2',
        };
      default:
        return {
          label: 'Unknown',
          color: '#6B7280',
          bgColor: '#F3F4F6',
        };
    }
  };

  const getStatusInfo = (status: AlertLog['status']) => {
    switch (status) {
      case 'sent':
        return {label: 'Delivered', color: '#22C55E'};
      case 'pending':
        return {label: 'Pending', color: '#F59E0B'};
      case 'failed':
        return {label: 'Failed', color: '#EF4444'};
      default:
        return {label: 'Unknown', color: '#6B7280'};
    }
  };

  const renderAlert = ({item}: {item: AlertLog}) => {
    const typeInfo = getAlertTypeInfo(item.alert_type);
    const statusInfo = getStatusInfo(item.status);

    return (
      <View style={styles.alertCard}>
        <View style={styles.alertHeader}>
          <View
            style={[styles.typeBadge, {backgroundColor: typeInfo.bgColor}]}>
            <Text style={[styles.typeText, {color: typeInfo.color}]}>
              {typeInfo.label}
            </Text>
          </View>
          <Text style={[styles.status, {color: statusInfo.color}]}>
            {statusInfo.label}
          </Text>
        </View>
        <Text style={styles.alertDate}>{formatDate(item.created_at)}</Text>
        {item.message && (
          <Text style={styles.alertMessage} numberOfLines={2}>
            {item.message}
          </Text>
        )}
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>No Alert History</Text>
      <Text style={styles.emptyDescription}>
        When alerts are triggered, they'll appear here.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Alert History</Text>
        </View>

        <FlatList
          data={alerts}
          renderItem={renderAlert}
          keyExtractor={item => item.id}
          ListEmptyComponent={!loading ? renderEmptyState : null}
          contentContainerStyle={
            alerts.length === 0 && !loading ? styles.emptyContainer : undefined
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  alertCard: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  status: {
    fontSize: 12,
    fontWeight: '600',
  },
  alertDate: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  alertMessage: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  separator: {
    height: 12,
  },
  emptyContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});
