import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import Card from '../components/Card';
import Button from '../components/Button';
import { databaseService, Guest } from '../database/DatabaseService';
import { formatDate, getStatusColor } from '../utils/helpers';

const AdminScreen: React.FC = () => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [stats, setStats] = useState({ total: 0, checkedIn: 0, checkedOut: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [guestList, guestStats] = await Promise.all([
        databaseService.getAllGuests(),
        databaseService.getGuestStats(),
      ]);
      setGuests(guestList);
      setStats(guestStats);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Gagal memuat data');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
  };

  const handleCheckOut = async (guestId: number, guestName: string) => {
    Alert.alert(
      'Konfirmasi Check Out',
      `Apakah Anda yakin ingin check out ${guestName}?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Check Out',
          onPress: async () => {
            try {
              await databaseService.checkOutGuest(guestId);
              Alert.alert('Berhasil', 'Guest berhasil di-check out');
              loadData();
            } catch (error) {
              console.error('Error checking out guest:', error);
              Alert.alert('Error', 'Gagal check out guest');
            }
          },
        },
      ]
    );
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const StatCard: React.FC<{ title: string; value: number; color: string; bgColor: string; icon: string }> = ({
    title,
    value,
    color,
    bgColor,
    icon,
  }) => {
    const cardStyle = { ...styles.statCard, backgroundColor: bgColor };
    return (
      <Card style={cardStyle}>
        <View style={styles.statHeader}>
          <Text style={styles.statIcon}>{icon}</Text>
          <Text style={styles.statTitle}>{title}</Text>
        </View>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
      </Card>
    );
  };

  const GuestCard: React.FC<{ guest: Guest }> = ({ guest }) => (
    <Card style={styles.guestCard}>
      <View style={styles.guestHeader}>
        <View style={styles.guestInfo}>
          <Text style={styles.guestName}>{guest.name}</Text>
          <Text style={styles.guestEmail}>{guest.email}</Text>
          <Text style={styles.guestPurpose}>{guest.purpose}</Text>
        </View>
        <View style={[styles.statusIndicator, { backgroundColor: guest.checkOut ? '#10B981' : '#F59E0B' }]} />
      </View>

      <View style={styles.guestDetails}>
        <View style={styles.guestDetailItem}>
          <Text style={styles.guestDetailLabel}>Check In:</Text>
          <Text style={styles.guestDetailValue}>{formatDate(guest.checkIn)}</Text>
        </View>
        {guest.checkOut && (
          <View style={styles.guestDetailItem}>
            <Text style={styles.guestDetailLabel}>Check Out:</Text>
            <Text style={styles.guestDetailValue}>{formatDate(guest.checkOut)}</Text>
          </View>
        )}
        <View style={styles.guestDetailItem}>
          <Text style={styles.guestDetailLabel}>Tanggal Kunjungan:</Text>
          <Text style={styles.guestDetailValue}>
            {guest.visitDate} {guest.visitTime}
          </Text>
        </View>
        <View style={styles.guestDetailItem}>
          <Text style={styles.guestDetailLabel}>Profesi:</Text>
          <Text style={styles.guestDetailValue}>{guest.profession}</Text>
        </View>
      </View>

      {!guest.checkOut && (
        <Button
          title="Check Out"
          onPress={() => guest.id && handleCheckOut(guest.id, guest.name)}
          variant="secondary"
          size="small"
          style={styles.checkoutButton}
        />
      )}
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <LinearGradient colors={['#4F46E5', '#7C3AED']} style={styles.header}>
          <Text style={styles.headerTitle}>🔐 Admin Dashboard</Text>
          <Text style={styles.headerDescription}>
            Kelola semua tamu dan pengaturan sistem
          </Text>
        </LinearGradient>

        <View style={styles.content}>
          {/* Statistics */}
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>📊 Statistik</Text>
            <View style={styles.statsGrid}>
              <StatCard
                title="Total Guests"
                value={stats.total}
                color="#3B82F6"
                bgColor="#EFF6FF"
                icon="👥"
              />
              <StatCard
                title="Checked In"
                value={stats.checkedIn}
                color="#10B981"
                bgColor="#ECFDF5"
                icon="✅"
              />
              <StatCard
                title="Checked Out"
                value={stats.checkedOut}
                color="#F59E0B"
                bgColor="#FFFBEB"
                icon="🚪"
              />
            </View>
          </View>

          {/* Guest Management */}
          <View style={styles.guestSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>👥 Manajemen Tamu</Text>
              <TouchableOpacity onPress={loadData}>
                <Text style={styles.refreshButton}>🔄 Refresh</Text>
              </TouchableOpacity>
            </View>

            {isLoading ? (
              <Card style={styles.loadingCard}>
                <Text style={styles.loadingText}>Memuat data...</Text>
              </Card>
            ) : guests.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>📭</Text>
                <Text style={styles.emptyText}>Belum ada tamu yang terdaftar</Text>
              </Card>
            ) : (
              <View style={styles.guestList}>
                {guests.map((guest) => (
                  <GuestCard key={guest.id} guest={guest} />
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  headerDescription: {
    fontSize: 16,
    color: '#E0E7FF',
    textAlign: 'center',
  },
  content: {
    padding: 20,
  },
  statsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  refreshButton: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '600',
  },
  statsGrid: {
    gap: 16,
  },
  statCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  statTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  guestSection: {
    marginBottom: 32,
  },
  guestList: {
    gap: 16,
  },
  guestCard: {
    padding: 16,
  },
  guestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  guestInfo: {
    flex: 1,
  },
  guestName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  guestEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  guestPurpose: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '500',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  guestDetails: {
    marginBottom: 16,
  },
  guestDetailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  guestDetailLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  guestDetailValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  checkoutButton: {
    alignSelf: 'flex-start',
  },
  loadingCard: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  emptyCard: {
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default AdminScreen;
