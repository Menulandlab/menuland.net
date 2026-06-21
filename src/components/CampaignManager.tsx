import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/src/constants/Colors';
import type { Campaign } from '@/src/types/campaign';

const API_BASE_URL = 'https://api.service.menuland.net';

interface CampaignManagerProps {
  businessId: number;
  token: string;
  onCampaignsUpdated: () => void;
}

const CampaignManager: React.FC<CampaignManagerProps> = ({
  businessId,
  token,
  onCampaignsUpdated,
}) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [formData, setFormData] = useState({
    image_url: '',
    product_name: '',
    current_price: '',
    discounted_price: '',
  });

  useEffect(() => {
    fetchCampaigns();
  }, [businessId]);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/businesses/${businessId}/campaigns`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Kampanyalar yüklenemedi`);
      }

      const data = await response.json();
      if (Array.isArray(data)) {
        setCampaigns(data);
      } else {
        setCampaigns([]);
      }
    } catch (error) {
      console.error('Kampanya yükleme hatası:', error);
      Alert.alert('Hata', 'Kampanyalar yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      image_url: '',
      product_name: '',
      current_price: '',
      discounted_price: '',
    });
  };

  const handleAddCampaign = async () => {
    // Form validasyonu
    if (!formData.image_url || !formData.product_name || !formData.current_price || !formData.discounted_price) {
      Alert.alert('Hata', 'Tüm alanları doldurun.');
      return;
    }

    const currentPrice = parseFloat(formData.current_price);
    const discountedPrice = parseFloat(formData.discounted_price);

    if (isNaN(currentPrice) || isNaN(discountedPrice)) {
      Alert.alert('Hata', 'Geçerli fiyat girin.');
      return;
    }

    if (discountedPrice >= currentPrice) {
      Alert.alert('Hata', 'İndirimli fiyat mevcut fiyattan düşük olmalı.');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/businesses/${businessId}/campaigns`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_url: formData.image_url,
          product_name: formData.product_name,
          current_price: currentPrice,
          discounted_price: discountedPrice,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Kampanya eklenemedi`);
      }

      Alert.alert('Başarılı', 'Kampanya başarıyla eklendi.');
      setShowAddModal(false);
      resetForm();
      fetchCampaigns();
      onCampaignsUpdated();
    } catch (error) {
      console.error('Kampanya ekleme hatası:', error);
      Alert.alert('Hata', 'Kampanya eklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCampaign = async () => {
    if (!editingCampaign) return;

    // Form validasyonu
    if (!formData.image_url || !formData.product_name || !formData.current_price || !formData.discounted_price) {
      Alert.alert('Hata', 'Tüm alanları doldurun.');
      return;
    }

    const currentPrice = parseFloat(formData.current_price);
    const discountedPrice = parseFloat(formData.discounted_price);

    if (isNaN(currentPrice) || isNaN(discountedPrice)) {
      Alert.alert('Hata', 'Geçerli fiyat girin.');
      return;
    }

    if (discountedPrice >= currentPrice) {
      Alert.alert('Hata', 'İndirimli fiyat mevcut fiyattan düşük olmalı.');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/businesses/${businessId}/campaigns/${editingCampaign.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_url: formData.image_url,
          product_name: formData.product_name,
          current_price: currentPrice,
          discounted_price: discountedPrice,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Kampanya güncellenemedi`);
      }

      Alert.alert('Başarılı', 'Kampanya başarıyla güncellendi.');
      setShowEditModal(false);
      setEditingCampaign(null);
      resetForm();
      fetchCampaigns();
      onCampaignsUpdated();
    } catch (error) {
      console.error('Kampanya güncelleme hatası:', error);
      Alert.alert('Hata', 'Kampanya güncellenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setFormData({
      image_url: campaign.image_url,
      product_name: campaign.product_name,
      current_price: campaign.current_price.toString(),
      discounted_price: campaign.discounted_price.toString(),
    });
    setShowEditModal(true);
  };

  const calculateDiscount = (currentPrice: number, discountedPrice: number) => {
    return Math.round(((currentPrice - discountedPrice) / currentPrice) * 100);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Kampanya Yönetimi</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add" size={24} color={Colors.white} />
          <Text style={styles.addButtonText}>Yeni Kampanya</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      ) : campaigns.length > 0 ? (
        <ScrollView style={styles.campaignsList}>
          {campaigns.map((campaign) => (
            <View key={campaign.id} style={styles.campaignCard}>
              <Image source={{ uri: campaign.image_url }} style={styles.campaignImage} />
              <View style={styles.campaignInfo}>
                <Text style={styles.campaignName}>{campaign.product_name}</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.oldPrice}>{campaign.current_price.toFixed(2)}₺</Text>
                  <Text style={styles.newPrice}>{campaign.discounted_price.toFixed(2)}₺</Text>
                </View>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>
                    %{calculateDiscount(campaign.current_price, campaign.discounted_price)} İndirim
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => openEditModal(campaign)}
              >
                <Ionicons name="pencil" size={20} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="megaphone-outline" size={48} color={Colors.textLight} />
          <Text style={styles.emptyText}>Henüz kampanya bulunmuyor</Text>
          <Text style={styles.emptySubtext}>İlk kampanyanızı ekleyerek başlayın</Text>
        </View>
      )}

      {/* Yeni Kampanya Ekleme Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Yeni Kampanya Ekle</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color={Colors.textLight} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              <Text style={styles.inputLabel}>Kampanya Görseli URL</Text>
              <TextInput
                style={styles.textInput}
                value={formData.image_url}
                onChangeText={(text) => setFormData({ ...formData, image_url: text })}
                placeholder="https://example.com/image.jpg"
                autoCapitalize="none"
              />

              <Text style={styles.inputLabel}>Ürün/Hizmet Adı</Text>
              <TextInput
                style={styles.textInput}
                value={formData.product_name}
                onChangeText={(text) => setFormData({ ...formData, product_name: text })}
                placeholder="Örn: Pizza Margherita"
              />

              <Text style={styles.inputLabel}>Mevcut Fiyat (₺)</Text>
              <TextInput
                style={styles.textInput}
                value={formData.current_price}
                onChangeText={(text) => setFormData({ ...formData, current_price: text })}
                placeholder="100.00"
                keyboardType="numeric"
              />

              <Text style={styles.inputLabel}>İndirimli Fiyat (₺)</Text>
              <TextInput
                style={styles.textInput}
                value={formData.discounted_price}
                onChangeText={(text) => setFormData({ ...formData, discounted_price: text })}
                placeholder="80.00"
                keyboardType="numeric"
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.cancelButtonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddCampaign}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <Text style={styles.saveButtonText}>Ekle</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Kampanya Düzenleme Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Kampanya Düzenle</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Ionicons name="close" size={24} color={Colors.textLight} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              <Text style={styles.inputLabel}>Kampanya Görseli URL</Text>
              <TextInput
                style={styles.textInput}
                value={formData.image_url}
                onChangeText={(text) => setFormData({ ...formData, image_url: text })}
                placeholder="https://example.com/image.jpg"
                autoCapitalize="none"
              />

              <Text style={styles.inputLabel}>Ürün/Hizmet Adı</Text>
              <TextInput
                style={styles.textInput}
                value={formData.product_name}
                onChangeText={(text) => setFormData({ ...formData, product_name: text })}
                placeholder="Örn: Pizza Margherita"
              />

              <Text style={styles.inputLabel}>Mevcut Fiyat (₺)</Text>
              <TextInput
                style={styles.textInput}
                value={formData.current_price}
                onChangeText={(text) => setFormData({ ...formData, current_price: text })}
                placeholder="100.00"
                keyboardType="numeric"
              />

              <Text style={styles.inputLabel}>İndirimli Fiyat (₺)</Text>
              <TextInput
                style={styles.textInput}
                value={formData.discounted_price}
                onChangeText={(text) => setFormData({ ...formData, discounted_price: text })}
                placeholder="80.00"
                keyboardType="numeric"
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.cancelButtonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleEditCampaign}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <Text style={styles.saveButtonText}>Güncelle</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: Colors.white,
    fontWeight: '600',
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: Colors.textLight,
    fontSize: 16,
  },
  campaignsList: {
    flex: 1,
  },
  campaignCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  campaignImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
    backgroundColor: '#f3f3f3',
  },
  campaignInfo: {
    flex: 1,
  },
  campaignName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  oldPrice: {
    fontSize: 14,
    color: Colors.textLight,
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  newPrice: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  discountBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  discountText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '600',
  },
  editButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 8,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  formContainer: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
    marginTop: 16,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: Colors.white,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: Colors.backgroundLight,
  },
  cancelButtonText: {
    color: Colors.text,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: Colors.primary,
  },
  saveButtonText: {
    color: Colors.white,
    fontWeight: '600',
  },
});

export default CampaignManager;


