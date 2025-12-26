import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { api } from '../api/client';

export default function ProfilesListScreen({ navigation }) {
  const [profiles, setProfiles] = useState([]);
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(false);      // pagination / load more
  const [refreshing, setRefreshing] = useState(false); // pull-to-refresh
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  // fetch function (supports refresh)
  const fetchProfiles = async ({ pageToLoad = page, replace = false } = {}) => {
    if (loading || (!hasMore && !replace)) return;

    setLoading(true);
    setError(null);

    try {
      const res = await api.get(`/profiles?page=${pageToLoad}&limit=10`);
      const data = res.data ?? [];

      if (replace) {
        setProfiles(data);
      } else {
        setProfiles((prev) => [...prev, ...data]);
      }

      if (data.length === 0) {
        setHasMore(false);
      } else {
        setHasMore(true);
        setPage(pageToLoad + 1);
      }
    } catch (err) {
      // interceptor Error throws => err.message is meaningful
      setError(err?.message || 'Failed to load profiles.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // initial load
    fetchProfiles({ pageToLoad: 1, replace: true });
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    setHasMore(true);
    setPage(1);
    await fetchProfiles({ pageToLoad: 1, replace: true });
    setRefreshing(false);
  };

  const renderItem = ({ item }) => (
    <Pressable
      style={styles.card}
      onPress={() => navigation.navigate('ProfileDetail', { id: item.id })}
    >
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.email}>{item.email}</Text>
    </Pressable>
  );

  const renderFooter = () => {
    // only show footer spinner when loading more (not on first load)
    if (!loading || profiles.length === 0) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No profiles found</Text>
      </View>
    );
  };

  // Initial loading screen (better UX)
  if (loading && profiles.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading profiles...</Text>
      </View>
    );
  }

  // Error screen when nothing loaded yet
  if (error && profiles.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable
          style={styles.retryButton}
          onPress={() => fetchProfiles({ pageToLoad: 1, replace: true })}
        >
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={profiles}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        onEndReached={() => fetchProfiles({ pageToLoad: page, replace: false })}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#666',
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});
