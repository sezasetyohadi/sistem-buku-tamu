import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import Card from '../components/Card';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const features = [
    {
      title: 'Pendaftaran Mudah',
      description: 'Daftarkan diri sebagai tamu dengan formulir digital yang sederhana dan user-friendly',
      icon: '📝',
      color: ['#3B82F6', '#1D4ED8'],
      route: 'Register' as keyof RootStackParamList,
    },
    {
      title: 'Permohonan Layanan',
      description: 'Ajukan permohonan layanan dengan sistem tracking yang transparan dan real-time',
      icon: '🙏',
      color: ['#10B981', '#047857'],
      route: 'ServiceRequest' as keyof RootStackParamList,
    },
    {
      title: 'Survei Kepuasan',
      description: 'Berikan feedback dan penilaian untuk membantu kami meningkatkan kualitas layanan',
      icon: '⭐',
      color: ['#F59E0B', '#D97706'],
      route: 'Survey' as keyof RootStackParamList,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <LinearGradient
          colors={['#4F46E5', '#7C3AED', '#EC4899']}
          style={styles.heroSection}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.heroContent}>
            <View style={styles.badge}>
              <View style={styles.statusDot} />
              <Text style={styles.badgeText}>Sistem Online • Tersedia 24/7</Text>
            </View>
            
            <Text style={styles.heroTitle}>
              Selamat Datang di{'\n'}
              <Text style={styles.heroTitleGradient}>Sistem Layanan Tamu</Text>
            </Text>
            
            <Text style={styles.heroDescription}>
              Daftarkan kunjungan Anda dengan mudah, ajukan permohonan layanan secara digital, 
              atau berikan feedback melalui survei kepuasan pelanggan kami
            </Text>
            
            <View style={styles.heroButtons}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => navigation.navigate('Register')}
              >
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>📝 Daftar Sebagai Tamu</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => navigation.navigate('ServiceRequest')}
              >
                <Text style={styles.secondaryButtonText}>🙏 Permohonan Layanan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>✨ Fitur Utama</Text>
            </View>
            <Text style={styles.sectionTitle}>Layanan Digital Terpadu</Text>
            <Text style={styles.sectionDescription}>
              Sistem manajemen tamu modern dengan teknologi terdepan untuk kemudahan dan efisiensi
            </Text>
          </View>

          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => navigation.navigate(feature.route)}
              >
                <Card style={styles.featureCard}>
                  <LinearGradient
                    colors={[`${feature.color[0]}20`, `${feature.color[1]}20`]}
                    style={styles.featureIconContainer}
                  >
                    <Text style={styles.featureIcon}>{feature.icon}</Text>
                  </LinearGradient>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </Card>
              </TouchableOpacity>
            ))}
          </View>

          {/* CTA Section */}
          <Card style={styles.ctaCard}>
            <LinearGradient
              colors={['#4F46E5', '#7C3AED']}
              style={styles.ctaGradient}
            >
              <Text style={styles.ctaTitle}>Mulai Sekarang!</Text>
              <Text style={styles.ctaDescription}>
                Bergabunglah dengan ribuan pengguna yang telah merasakan kemudahan layanan digital kami
              </Text>
              <View style={styles.ctaButtons}>
                <TouchableOpacity
                  style={styles.ctaPrimaryButton}
                  onPress={() => navigation.navigate('Register')}
                >
                  <Text style={styles.ctaPrimaryButtonText}>Daftar Sekarang</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.ctaSecondaryButton}
                  onPress={() => navigation.navigate('Survey')}
                >
                  <Text style={styles.ctaSecondaryButtonText}>Berikan Feedback</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </Card>

          {/* Admin Access */}
          <TouchableOpacity
            style={styles.adminButton}
            onPress={() => navigation.navigate('Admin')}
          >
            <Text style={styles.adminButtonText}>🔐 Admin Dashboard</Text>
          </TouchableOpacity>
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
  heroSection: {
    paddingHorizontal: 20,
    paddingVertical: 60,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  heroContent: {
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    backgroundColor: '#10B981',
    borderRadius: 4,
    marginRight: 8,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 36,
  },
  heroTitleGradient: {
    color: '#FEF3C7',
  },
  heroDescription: {
    fontSize: 16,
    color: '#E0E7FF',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  heroButtons: {
    width: '100%',
    paddingHorizontal: 20,
  },
  primaryButton: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderRadius: 12,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  secondaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  featuresSection: {
    padding: 20,
  },
  sectionHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  sectionBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  sectionBadgeText: {
    color: '#4F46E5',
    fontSize: 12,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
  },
  sectionDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresGrid: {
    marginBottom: 32,
  },
  featureCard: {
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  featureIcon: {
    fontSize: 24,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  ctaCard: {
    padding: 0,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 32,
  },
  ctaGradient: {
    padding: 32,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
  },
  ctaDescription: {
    fontSize: 16,
    color: '#E0E7FF',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  ctaButtons: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  ctaPrimaryButton: {
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  ctaPrimaryButtonText: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '600',
  },
  ctaSecondaryButton: {
    borderWidth: 2,
    borderColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  ctaSecondaryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  adminButton: {
    backgroundColor: '#374151',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  adminButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeScreen;
