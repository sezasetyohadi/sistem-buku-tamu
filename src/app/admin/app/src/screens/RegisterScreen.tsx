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
import * as DocumentPicker from 'expo-document-picker';
import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';
import { validateForm } from '../utils/helpers';
import { databaseService } from '../database/DatabaseService';

const RegisterScreen: React.FC = () => {
  const [formData, setFormData] = useState({
    namaLengkap: '',
    email: '',
    phone: '',
    alamatLengkap: '',
    jenisKelamin: '',
    pendidikanTerakhir: '',
    profesiInstansi: '',
    alamatInstansi: '',
    keperluan: '',
    tujuanPertemuan: '',
    tanggalKunjungan: '',
    jamKunjungan: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFilePicker = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedFile(result.assets[0]);
        Alert.alert('Berhasil', 'File berhasil dipilih');
      }
    } catch (error) {
      Alert.alert('Error', 'Gagal memilih file');
    }
  };

  const handleSubmit = async () => {
    const requiredFields = [
      'namaLengkap',
      'email',
      'alamatLengkap',
      'jenisKelamin',
      'pendidikanTerakhir',
      'profesiInstansi',
      'keperluan',
      'tujuanPertemuan',
      'tanggalKunjungan',
      'jamKunjungan',
    ];

    const validationErrors = validateForm(formData, requiredFields);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    try {
      const currentTime = new Date().toISOString();
      
      await databaseService.addGuest({
        name: formData.namaLengkap,
        email: formData.email,
        phone: formData.phone,
        address: formData.alamatLengkap,
        gender: formData.jenisKelamin,
        education: formData.pendidikanTerakhir,
        profession: formData.profesiInstansi,
        institutionAddress: formData.alamatInstansi,
        purpose: formData.keperluan,
        meetingObjective: formData.tujuanPertemuan,
        visitDate: formData.tanggalKunjungan,
        visitTime: formData.jamKunjungan,
        fileName: selectedFile?.name,
        checkIn: currentTime,
        createdAt: currentTime,
      });

      Alert.alert(
        'Berhasil!',
        'Pendaftaran tamu berhasil disimpan. Terima kasih!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setFormData({
                namaLengkap: '',
                email: '',
                phone: '',
                alamatLengkap: '',
                jenisKelamin: '',
                pendidikanTerakhir: '',
                profesiInstansi: '',
                alamatInstansi: '',
                keperluan: '',
                tujuanPertemuan: '',
                tanggalKunjungan: '',
                jamKunjungan: '',
              });
              setSelectedFile(null);
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error saving guest:', error);
      Alert.alert('Error', 'Gagal menyimpan data pendaftaran');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={['#4F46E5', '#7C3AED']}
          style={styles.header}
        >
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>👤 Formulir Pendaftaran</Text>
          </View>
          <Text style={styles.headerTitle}>📝 Formulir Pendaftaran Tamu</Text>
          <Text style={styles.headerDescription}>
            Lengkapi formulir di bawah ini untuk mendaftarkan kunjungan Anda
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
              placeholder="Masukkan nama lengkap Anda"
              required
              error={errors.namaLengkap}
              icon="👤"
            />

            <Input
              label="Email"
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              placeholder="contoh@email.com"
              keyboardType="email-address"
              required
              error={errors.email}
              icon="📧"
            />

            <Input
              label="Nomor Telepon"
              value={formData.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              placeholder="Masukkan nomor telepon"
              keyboardType="phone-pad"
              error={errors.phone}
              icon="📱"
            />

            <Input
              label="Alamat Lengkap"
              value={formData.alamatLengkap}
              onChangeText={(value) => handleInputChange('alamatLengkap', value)}
              placeholder="Masukkan alamat lengkap Anda"
              multiline
              numberOfLines={3}
              required
              error={errors.alamatLengkap}
              icon="🏠"
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
              placeholder="Masukkan profesi atau instansi"
              required
              error={errors.profesiInstansi}
              icon="💼"
            />

            <Input
              label="Alamat Instansi"
              value={formData.alamatInstansi}
              onChangeText={(value) => handleInputChange('alamatInstansi', value)}
              placeholder="Masukkan alamat instansi"
              multiline
              numberOfLines={2}
              icon="🏢"
            />

            <Input
              label="Keperluan"
              value={formData.keperluan}
              onChangeText={(value) => handleInputChange('keperluan', value)}
              placeholder="Jelaskan keperluan kunjungan Anda"
              multiline
              numberOfLines={3}
              required
              error={errors.keperluan}
              icon="📋"
            />

            <Input
              label="Tujuan Pertemuan"
              value={formData.tujuanPertemuan}
              onChangeText={(value) => handleInputChange('tujuanPertemuan', value)}
              placeholder="Jelaskan tujuan pertemuan"
              multiline
              numberOfLines={3}
              required
              error={errors.tujuanPertemuan}
              icon="🎯"
            />

            {/* Date and Time */}
            <Text style={styles.sectionTitle}>📅 Waktu Kunjungan</Text>

            <Input
              label="Tanggal Kunjungan"
              value={formData.tanggalKunjungan}
              onChangeText={(value) => handleInputChange('tanggalKunjungan', value)}
              placeholder="YYYY-MM-DD"
              required
              error={errors.tanggalKunjungan}
              icon="📅"
            />

            <Input
              label="Jam Kunjungan"
              value={formData.jamKunjungan}
              onChangeText={(value) => handleInputChange('jamKunjungan', value)}
              placeholder="HH:MM"
              required
              error={errors.jamKunjungan}
              icon="🕐"
            />

            {/* File Upload */}
            <Text style={styles.sectionTitle}>📎 File Berkas</Text>
            <TouchableOpacity style={styles.fileButton} onPress={handleFilePicker}>
              <Text style={styles.fileButtonText}>
                📁 {selectedFile ? selectedFile.name : 'Pilih File (Opsional)'}
              </Text>
            </TouchableOpacity>
            <Text style={styles.fileInfo}>
              Format yang didukung: PDF, DOC, DOCX, JPG, PNG (Maksimal 5MB per file)
            </Text>

            <Button
              title="✅ Daftar Sebagai Tamu"
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
    color: '#E0E7FF',
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
  fileButton: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    marginBottom: 8,
  },
  fileButtonText: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '500',
  },
  fileInfo: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 24,
  },
  submitButton: {
    marginTop: 20,
  },
});

export default RegisterScreen;
