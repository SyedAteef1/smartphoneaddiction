import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { useDetailedUsage } from '../hooks/useDetailedUsage';
import { formatScreenTime } from '../utils/usageEventsProcessor';
import type { AppUsageSummary } from '../utils/usageEventsProcessor';

type TimeRange = 'today' | 'yesterday' | 'week';
type SortMode = 'screenTime' | 'launches';

export const DetailedUsageView = () => {
  const {
    sortedByScreenTime,
    sortedByLaunches,
    totalScreenTime,
    isLoading,
    error,
    hasPermission,
    requestPermission,
    getTodayUsage,
    getYesterdayUsage,
    getWeekUsage,
    formatScreenTime: formatTime
  } = useDetailedUsage();

  const [timeRange, setTimeRange] = useState<TimeRange>('today');
  const [sortMode, setSortMode] = useState<SortMode>('screenTime');

  const handleTimeRangeChange = async (range: TimeRange) => {
    setTimeRange(range);
    switch (range) {
      case 'today':
        await getTodayUsage();
        break;
      case 'yesterday':
        await getYesterdayUsage();
        break;
      case 'week':
        await getWeekUsage();
        break;
    }
  };

  const renderAppItem = ({ item }: { item: AppUsageSummary }) => {
    const percentage = totalScreenTime > 0 
      ? (item.screenTime / totalScreenTime) * 100 
      : 0;

    return (
      <View style={styles.appItem}>
        <View style={styles.appInfo}>
          <View style={styles.appIconPlaceholder}>
            <Text style={styles.appIconText}>
              {item.appName?.charAt(0).toUpperCase() || '?'}
            </Text>
          </View>
          <View style={styles.appDetails}>
            <Text style={styles.appName} numberOfLines={1}>
              {item.appName || item.packageName}
            </Text>
            <View style={styles.appStats}>
              {sortMode === 'screenTime' ? (
                <>
                  <Text style={styles.appStatsText}>
                    {formatTime(item.screenTime)}
                  </Text>
                  {item.launches > 0 && (
                    <Text style={styles.appStatsSecondary}>
                      • {item.launches} {item.launches === 1 ? 'time' : 'times'}
                    </Text>
                  )}
                </>
              ) : (
                <>
                  <Text style={styles.appStatsText}>
                    {item.launches} {item.launches === 1 ? 'launch' : 'launches'}
                  </Text>
                  {item.screenTime > 0 && (
                    <Text style={styles.appStatsSecondary}>
                      • {formatTime(item.screenTime)}
                    </Text>
                  )}
                </>
              )}
            </View>
          </View>
        </View>
        {sortMode === 'screenTime' && (
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${percentage}%` }]} />
          </View>
        )}
      </View>
    );
  };

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionTitle}>Usage Access Required</Text>
          <Text style={styles.permissionText}>
            To display detailed app usage statistics like Digital Wellbeing, 
            this app needs access to usage data.
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const displayData = sortMode === 'screenTime' ? sortedByScreenTime : sortedByLaunches;

  return (
    <View style={styles.container}>
      {/* Total Screen Time Header */}
      <View style={styles.header}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total Screen Time</Text>
          <Text style={styles.totalTime}>{formatTime(totalScreenTime)}</Text>
          {sortedByScreenTime.length > 0 && (
            <Text style={styles.totalSubtext}>
              {sortedByScreenTime.length} {sortedByScreenTime.length === 1 ? 'app' : 'apps'} used
            </Text>
          )}
        </View>
      </View>

      {/* Time Range Selector */}
      <View style={styles.filterContainer}>
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterButton, timeRange === 'today' && styles.filterButtonActive]}
            onPress={() => handleTimeRangeChange('today')}
          >
            <Text style={[styles.filterText, timeRange === 'today' && styles.filterTextActive]}>
              Today
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, timeRange === 'yesterday' && styles.filterButtonActive]}
            onPress={() => handleTimeRangeChange('yesterday')}
          >
            <Text style={[styles.filterText, timeRange === 'yesterday' && styles.filterTextActive]}>
              Yesterday
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, timeRange === 'week' && styles.filterButtonActive]}
            onPress={() => handleTimeRangeChange('week')}
          >
            <Text style={[styles.filterText, timeRange === 'week' && styles.filterTextActive]}>
              Last 7 Days
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sort Mode Selector */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterButton, sortMode === 'screenTime' && styles.filterButtonActive]}
            onPress={() => setSortMode('screenTime')}
          >
            <Text style={[styles.filterText, sortMode === 'screenTime' && styles.filterTextActive]}>
              By Time
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, sortMode === 'launches' && styles.filterButtonActive]}
            onPress={() => setSortMode('launches')}
          >
            <Text style={[styles.filterText, sortMode === 'launches' && styles.filterTextActive]}>
              By Launches
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* App List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading usage data...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => handleTimeRangeChange(timeRange)}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : displayData.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No usage data available</Text>
          <Text style={styles.emptySubtext}>
            Use some apps and check back later
          </Text>
        </View>
      ) : (
        <FlatList
          data={displayData}
          renderItem={renderAppItem}
          keyExtractor={(item) => item.packageName}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#fff',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    alignItems: 'center',
  },
  totalContainer: {
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  totalTime: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  totalSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  filterContainer: {
    backgroundColor: '#fff',
    padding: 16,
    gap: 12,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterTextActive: {
    color: '#fff',
  },
  listContainer: {
    padding: 16,
  },
  appItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  appInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appIconPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  appIconText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  appDetails: {
    flex: 1,
  },
  appName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  appStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appStatsText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
  },
  appStatsSecondary: {
    fontSize: 14,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  progressBarContainer: {
    marginTop: 12,
    height: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  permissionButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    backgroundColor: '#007AFF',
    borderRadius: 12,
  },
  permissionButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
});






