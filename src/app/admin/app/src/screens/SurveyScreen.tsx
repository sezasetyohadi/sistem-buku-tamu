import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';
import { validateForm } from '../utils/helpers';
import { databaseService } from '../database/DatabaseService';

const SurveyScreen: React.FC = () => {
  const [formData, setFormData] = useState({
    namaLengkap: '',
    jenisKelamin: '',
    pendidikanTerakhir: '',
    profesiInstansi: '',
    umur: '',
    kemudahanAkses: '',
    kecepatanPelayanan: '',
    kemampuanPetugas: '',
    kualitasHasil: '',
    fasilitasTersedia: '',
    saranMasukan: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async () => {
    const requiredFields = [
      'namaLengkap',
      'jenisKelamin',
      'pendidikanTerakhir',
      'profesiInstansi',
      'umur',
      'kemudahanAkses',
      'kecepatanPelayanan',
      'kemampuanPetugas',
      'kualitasHasil',
      'fasilitasTersedia',
    ];

    const validationErrors = validateForm(formData, requiredFields);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    try {
      const currentTime = new Date().toISOString();
      
      await databaseService.addSurvey({
        name: formData.namaLengkap,
        gender: formData.jenisKelamin,
        education: formData.pendidikanTerakhir,
        profession: formData.profesiInstansi,
        age: parseInt(formData.umur),
        accessEase: formData.kemudahanAkses,
        serviceSpeed: formData.kecepatanPelayanan,
        staffCapability: formData.kemampuanPetugas,
        resultQuality: formData.kualitasHasil,
        facilities: formData.fasilitasTersedia,
        suggestions: formData.saranMasukan,
        createdAt: currentTime,
      });

      Alert.alert(
        'Berhasil!',
        'Terima kasih atas feedback Anda! Survei kepuasan berhasil dikirim.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setFormData({
                namaLengkap: '',
                jenisKelamin: '',
                pendidikanTerakhir: '',
                profesiInstansi: '',
                umur: '',
                kemudahanAkses: '',
                kecepatanPelayanan: '',
                kemampuanPetugas: '',
                kualitasHasil: '',
                fasilitasTersedia: '',
                saranMasukan: '',
              });
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error saving survey:', error);
      Alert.alert('Error', 'Gagal mengirim survei');
    } finally {
      setIsLoading(false);
    }
  };

  const RatingQuestion: React.FC<{
    title: string;
    field: string;
    value: string;
    icon: string;
  }> = ({ title, field, value, icon }) => (
    <Card style={styles.ratingCard}>
      <Text style={styles.ratingTitle}>
        {icon} {title} <Text style={styles.required}>*</Text>
      </Text>
      <View style={styles.ratingOptions}>
        {[
          { value: 'Memuaskan', label: '😊 Memuaskan', color: '#10B981' },
          { value: 'Cukup', label: '😐 Cukup', color: '#F59E0B' },
          { value: 'Kurang', label: '😞 Kurang', color: '#EF4444' },
        ].map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.ratingOption,
              value === option.value && { backgroundColor: `${option.color}20` },
            ]}
            onPress={() => handleInputChange(field, option.value)}
          >
            <View style={styles.ratingRadio}>
              {value === option.value && (
                <View style={[styles.ratingRadioSelected, { backgroundColor: option.color }]} />
              )}
            </View>
            <Text style={[styles.ratingLabel, { color: option.color }]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={['#F59E0B', '#D97706']}
          style={styles.header}
        >
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>⭐ Survei Kepuasan</Text>
          </View>
          <Text style={styles.headerTitle}>⭐ Survei Kepuasan Layanan</Text>
          <Text style={styles.headerDescription}>
            Berikan penilaian Anda terhadap layanan yang telah diberikan untuk membantu kami meningkatkan kualitas pelayanan
          </Text>
        </LinearGradient>

        <View style={styles.content}>
          <Card>
            {/* Personal Information */}
            <Text style={styles.sectionTitle}>👤 Informasi Personal</Text>
            
            <Input
              label="Nama Lengkap"
              value={formData.namaLengkap}
              onChangeText={(value) => handleInputChange('namaLengkap', value)}
              placeholder="Masukkan nama lengkap"
              required
              error={errors.namaLengkap}
              icon="✍️"
            />

            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                👫 Jenis Kelamin <Text style={styles.required}>*</Text>
              </Text>
              <View style={[styles.pickerContainer, errors.jenisKelamin && styles.pickerError]}>
                <Picker
                  selectedValue={formData.jenisKelamin}
                  onValueChange={(value: string) => handleInputChange('jenisKelamin', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Pilih Jenis Kelamin" value="" />
                  <Picker.Item label="Laki-laki" value="Laki-laki" />
                  <Picker.Item label="Perempuan" value="Perempuan" />
                </Picker>
              </View>
              {errors.jenisKelamin && <Text style={styles.errorText}>{errors.jenisKelamin}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                🎓 Pendidikan Terakhir <Text style={styles.required}>*</Text>
              </Text>
              <View style={[styles.pickerContainer, errors.pendidikanTerakhir && styles.pickerError]}>
                <Picker
                  selectedValue={formData.pendidikanTerakhir}
                  onValueChange={(value: string) => handleInputChange('pendidikanTerakhir', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Pilih Pendidikan" value="" />
                  <Picker.Item label="SD" value="SD" />
                  <Picker.Item label="SMP" value="SMP" />
                  <Picker.Item label="SMA/SMK" value="SMA/SMK" />
                  <Picker.Item label="D3" value="D3" />
                  <Picker.Item label="S1" value="S1" />
                  <Picker.Item label="S2" value="S2" />
                  <Picker.Item label="S3" value="S3" />
                </Picker>
              </View>
              {errors.pendidikanTerakhir && <Text style={styles.errorText}>{errors.pendidikanTerakhir}</Text>}
            </View>

            <Input
              label="Profesi/Instansi"
              value={formData.profesiInstansi}
              onChangeText={(value) => handleInputChange('profesiInstansi', value)}
              placeholder="Masukkan profesi/instansi"
              required
              error={errors.profesiInstansi}
              icon="💼"
            />

            <Input
              label="Umur"
              value={formData.umur}
              onChangeText={(value) => handleInputChange('umur', value)}
              placeholder="Masukkan umur"
              keyboardType="numeric"
              required
              error={errors.umur}
              icon="🎂"
            />

            {/* Satisfaction Questions */}
            <Text style={styles.sectionTitle}>📊 Penilaian Kepuasan Layanan</Text>

            <RatingQuestion
              title="1. Bagaimana penilaian Anda terhadap kemudahan akses layanan?"
              field="kemudahanAkses"
              value={formData.kemudahanAkses}
              icon="🚪"
            />

            <RatingQuestion
              title="2. Bagaimana penilaian Anda terhadap kecepatan pelayanan?"
              field="kecepatanPelayanan"
              value={formData.kecepatanPelayanan}
              icon="⚡"
            />

            <RatingQuestion
              title="3. Bagaimana penilaian Anda terhadap kemampuan petugas?"
              field="kemampuanPetugas"
              value={formData.kemampuanPetugas}
              icon="👨‍💼"
            />

            <RatingQuestion
              title="4. Bagaimana penilaian Anda terhadap kualitas hasil layanan?"
              field="kualitasHasil"
              value={formData.kualitasHasil}
              icon="🏆"
            />

            <RatingQuestion
              title="5. Bagaimana penilaian Anda terhadap fasilitas yang tersedia?"
              field="fasilitasTersedia"
              value={formData.fasilitasTersedia}
              icon="🏢"
            />

            {/* Feedback Section */}
            <Text style={styles.sectionTitle}>💭 Saran dan Masukan</Text>

            <Input
              label="Berikan saran dan masukan untuk perbaikan layanan"
              value={formData.saranMasukan}
              onChangeText={(value) => handleInputChange('saranMasukan', value)}
              placeholder="Berikan saran dan masukan untuk perbaikan layanan kami..."
              multiline
              numberOfLines={6}
              icon="📝"
            />

            <Button
              title="📤 Kirim Survei"
              onPress={handleSubmit}
              loading={isLoading}
              style={styles.submitButton}
            />
          </Card>
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
  headerBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  headerBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 12,
  },
  headerDescription: {
    fontSize: 16,
    color: '#FEF3C7',
    textAlign: 'center',
    lineHeight: 24,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
    marginTop: 8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  required: {
    color: '#EF4444',
  },
  pickerContainer: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: 'white',
  },
  pickerError: {
    borderColor: '#EF4444',
  },
  picker: {
    height: 50,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  ratingCard: {
    backgroundColor: '#F9FAFB',
    marginBottom: 16,
    padding: 16,
  },
  ratingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  ratingOptions: {
    gap: 8,
  },
  ratingOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: 'white',
  },
  ratingRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingRadioSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  ratingLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  submitButton: {
    marginTop: 20,
  },
});

export default SurveyScreen;
