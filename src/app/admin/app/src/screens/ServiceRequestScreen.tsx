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

const ServiceRequestScreen: React.FC = () => {
  const [formData, setFormData] = useState({
    namaLengkap: '',
    email: '',
    jenisLayanan: '',
    prioritas: '',
    deskripsiPermohonan: '',
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
      'jenisLayanan',
      'prioritas',
      'deskripsiPermohonan',
    ];

    const validationErrors = validateForm(formData, requiredFields);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    try {
      const currentTime = new Date().toISOString();
      
      await databaseService.addServiceRequest({
        name: formData.namaLengkap,
        email: formData.email,
        serviceType: formData.jenisLayanan,
        priority: formData.prioritas,
        description: formData.deskripsiPermohonan,
        fileName: selectedFile?.name,
        status: 'pending',
        createdAt: currentTime,
      });

      Alert.alert(
        'Berhasil!',
        'Permohonan layanan berhasil dikirim. Kami akan segera memprosesnya.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setFormData({
                namaLengkap: '',
                email: '',
                jenisLayanan: '',
                prioritas: '',
                deskripsiPermohonan: '',
              });
              setSelectedFile(null);
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error saving service request:', error);
      Alert.alert('Error', 'Gagal mengirim permohonan layanan');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={['#7C3AED', '#4F46E5']}
          style={styles.header}
        >
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>🙏 Permohonan Layanan</Text>
          </View>
          <Text style={styles.headerTitle}>📋 Formulir Permohonan Layanan</Text>
          <Text style={styles.headerDescription}>
            Ajukan permohonan layanan Anda dengan mudah melalui formulir digital yang tersedia
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

            {/* Service Details */}
            <Text style={styles.sectionTitle}>🛠️ Detail Layanan</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                🔧 Jenis Layanan <Text style={styles.required}>*</Text>
              </Text>
              <View style={[styles.pickerContainer, errors.jenisLayanan && styles.pickerError]}>
                <Picker
                  selectedValue={formData.jenisLayanan}
                  onValueChange={(value: string) => handleInputChange('jenisLayanan', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Pilih Jenis Layanan" value="" />
                  <Picker.Item label="🗣️ Konsultasi" value="Konsultasi" />
                  <Picker.Item label="📄 Pengajuan Dokumen" value="Pengajuan Dokumen" />
                  <Picker.Item label="🔧 Bantuan Teknis" value="Bantuan Teknis" />
                  <Picker.Item label="ℹ️ Informasi" value="Informasi" />
                  <Picker.Item label="❗ Komplain" value="Komplain" />
                  <Picker.Item label="📝 Lainnya" value="Lainnya" />
                </Picker>
              </View>
              {errors.jenisLayanan && <Text style={styles.errorText}>{errors.jenisLayanan}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                ⚡ Prioritas <Text style={styles.required}>*</Text>
              </Text>
              <View style={[styles.pickerContainer, errors.prioritas && styles.pickerError]}>
                <Picker
                  selectedValue={formData.prioritas}
                  onValueChange={(value: string) => handleInputChange('prioritas', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Pilih Prioritas" value="" />
                  <Picker.Item label="🟢 Rendah" value="Rendah" />
                  <Picker.Item label="🟡 Sedang" value="Sedang" />
                  <Picker.Item label="🟠 Tinggi" value="Tinggi" />
                  <Picker.Item label="🔴 Urgent" value="Urgent" />
                </Picker>
              </View>
              {errors.prioritas && <Text style={styles.errorText}>{errors.prioritas}</Text>}
            </View>

            {/* Description */}
            <Text style={styles.sectionTitle}>📝 Deskripsi Permohonan</Text>

            <Input
              label="Jelaskan detail permohonan layanan Anda"
              value={formData.deskripsiPermohonan}
              onChangeText={(value) => handleInputChange('deskripsiPermohonan', value)}
              placeholder="Jelaskan detail permohonan layanan Anda..."
              multiline
              numberOfLines={6}
              required
              error={errors.deskripsiPermohonan}
              icon="📋"
            />

            {/* File Upload */}
            <Text style={styles.sectionTitle}>📎 File Pendukung</Text>
            <TouchableOpacity style={styles.fileButton} onPress={handleFilePicker}>
              <Text style={styles.fileButtonText}>
                📁 {selectedFile ? selectedFile.name : 'Pilih File Pendukung (Opsional)'}
              </Text>
            </TouchableOpacity>
            <Text style={styles.fileInfo}>
              Format yang didukung: PDF, DOC, DOCX, JPG, PNG (Maksimal 5MB per file)
            </Text>

            {/* Information Box */}
            <Card style={styles.infoBox}>
              <Text style={styles.infoIcon}>💡</Text>
              <Text style={styles.infoTitle}>Informasi Penting</Text>
              <Text style={styles.infoText}>
                • Permohonan akan diproses dalam 1-3 hari kerja{'\n'}
                • Anda akan mendapat notifikasi status via email{'\n'}
                • Untuk permohonan urgent, silakan hubungi langsung customer service{'\n'}
                • Pastikan data yang dimasukkan sudah benar dan lengkap
              </Text>
            </Card>

            <Button
              title="🚀 Kirim Permohonan"
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
  infoBox: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderWidth: 1,
    marginBottom: 24,
  },
  infoIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
  },
  submitButton: {
    marginTop: 20,
  },
});

export default ServiceRequestScreen;
