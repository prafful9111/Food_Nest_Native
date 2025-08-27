import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Modal,
  TextInput,
  Image,
  Switch as RNSwitch,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

// ---- Local fallback images (kept for placeholders) ----
const Chai = require('../../../assets/chai.png');
const VadaPav = require('../../../assets/vadapav.png');
const Poha = require('../../../assets/poha.png');
const Water = require('../../../assets/water.png');

// ====== API CONFIG (adjust to your env) ======
// TIP: if you already keep API_BASE_URL in a central file, import it here instead.
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.29.87:1900'; // e.g., http://192.168.1.5:1900 on device

// ---- Types (aligns with backend schema below) ----
type Item = {
  _id: string;
  name: string;
  price: number;
  category: string;
  available: boolean;
  tax?: number;
  imageUrl?: string | null; // served from backend
  // UI-only fallback for old seeds
  image?: any;
};

const toINR = (thb: number) => Math.round(thb * 2.5);

export default function FoodItems() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);

  // form state
  const [name, setName] = useState('');
  const [price, setPrice] = useState<string>('');
  const [category, setCategory] = useState('');
  const [tax, setTax] = useState<string>('');
  const [available, setAvailable] = useState(true);
  const [picked, setPicked] = useState<{
    uri: string;
    type?: string;
    name?: string;
    fileName?: string;
    mimeType?: string;
  } | null>(null);

  const resetForm = () => {
    setEditing(null);
    setName('');
    setPrice('');
    setCategory('');
    setTax('');
    setAvailable(true);
    setPicked(null);
  };

  const openAdd = () => {
    resetForm();
    setIsAdding(true);
  };

  const openEdit = (it: Item) => {
    setEditing(it);
    setName(it.name);
    setPrice(String(it.price));
    setCategory(it.category);
    setTax(it.tax ? String(it.tax) : '');
    setAvailable(it.available);
    setPicked(null); // don't prefill image picker
    setIsAdding(true);
  };

  // ===== Pick image (Expo) =====
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission needed',
        'We need media permission to choose a photo.'
      );
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!res.canceled && res.assets?.length) {
      const a = res.assets[0];
      setPicked({
        uri: a.uri,
        // keep a usable type/name for uploads even if Expo gives null
        type: a.mimeType ?? 'image/jpeg',
        name: a.fileName ?? 'food.jpg',

        // FIX: coerce null -> undefined to satisfy your picked type
        fileName: a.fileName ?? undefined,
        mimeType: a.mimeType ?? undefined,
      });
    }
  };

  // ===== API helpers =====
  async function apiGet<T>(path: string): Promise<T> {
    const r = await fetch(`${API_URL}${path}`);
    if (!r.ok) throw new Error(await r.text());
    return (await r.json()) as T;
  }
  async function apiSend<T>(
    path: string,
    method: string,
    body: any,
    isForm = false
  ): Promise<T> {
    const r = await fetch(`${API_URL}${path}`, {
      method,
      headers: isForm ? undefined : { 'Content-Type': 'application/json' },
      body: isForm ? body : JSON.stringify(body),
    });
    if (!r.ok) throw new Error(await r.text());
    return (await r.json()) as T;
  }

  // ===== Load items from backend =====
  const load = async () => {
    setLoading(true);
    try {
      const data = await apiGet<Item[]>('/api/foods');
      setItems(data);
    } catch (e: any) {
      console.warn('/api/foods failed:', e?.message || e);
      // Fallback: local seeds so screen isn't empty
      setItems([
        {
          _id: '1',
          name: 'Poha',
          price: 20,
          category: 'Snacks',
          available: true,
          image: Poha,
        },
        {
          _id: '2',
          name: 'Vada Pav',
          price: 30,
          category: 'Snacks',
          available: true,
          image: VadaPav,
        },
        {
          _id: '3',
          name: 'Tea',
          price: 7.99,
          category: 'Beverages',
          available: false,
          image: Chai,
        },
        {
          _id: '4',
          name: 'Water Bottle',
          price: 6.99,
          category: 'Beverages',
          available: true,
          image: Water,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // ===== Build a robust RN file part =====
  function toFilePart(p: {
    uri: string;
    type?: string;
    name?: string;
    mimeType?: string;
    fileName?: string;
  }) {
    const uri = p.uri;

    const sourceName = p.fileName || p.name || '';
    const fromUri = uri.split('?')[0].split('#')[0];
    const rawLast = (sourceName || fromUri).split('/').pop() || 'image.jpg';

    const hasExt = /\.[a-z0-9]+$/i.test(rawLast);
    const name = hasExt ? rawLast : `${rawLast}.jpg`;

    const ext = (name.split('.').pop() || '').toLowerCase();
    const type =
      p.mimeType ||
      p.type ||
      (ext === 'png'
        ? 'image/png'
        : ext === 'webp'
        ? 'image/webp'
        : ext === 'gif'
        ? 'image/gif'
        : 'image/jpeg');

    return { uri, name, type } as any;
  }

  async function appendPickedImage(fd: FormData, picked: { uri: string; type?: string; name?: string; mimeType?: string; fileName?: string }) {
    if (!picked) return;
  
    // build a solid name/type using your existing logic
    const part = toFilePart(picked); // returns { uri, name, type }
  
    if (Platform.OS === "web") {
      const resp = await fetch(part.uri);
      const blob = await resp.blob();
      // Some browsers need a File to keep the filename
      const file = new File([blob], part.name, { type: part.type || blob.type || "image/jpeg" });
      fd.append("image", file);
    } else {
      // iOS/Android RN style
      fd.append("image", part as any);
    }
  }

  // ===== Create / Update =====
  const save = async () => {
    const p = Number(price);
    const t = tax ? Number(tax) : undefined;
    if (!name.trim() || !category.trim() || Number.isNaN(p)) {
      Alert.alert('Please fill valid Name, Category and Price.');
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        // PATCH JSON (image optional via multipart)
        let updated: Item;
        if (picked) {
          const fd = new FormData();
          fd.append('name', name);
          fd.append('price', String(p));
          fd.append('category', category);
          if (t !== undefined) fd.append('tax', String(t));
          fd.append('available', String(available));
          // Use robust file-part builder
          await appendPickedImage(fd, picked);
          updated = await apiSend<Item>(
            `/api/foods/${editing._id}`,
            'PATCH',
            fd,
            true
          );
        } else {
          updated = await apiSend<Item>(`/api/foods/${editing._id}`, 'PATCH', {
            name,
            price: p,
            category,
            tax: t,
            available,
          });
        }
        setItems((arr) =>
          arr.map((x) => (x._id === editing._id ? updated : x))
        );
      } else {
        const fd = new FormData();
        fd.append('name', name);
        fd.append('price', String(p));
        fd.append('category', category);
        if (t !== undefined) fd.append('tax', String(t));
        fd.append('available', String(available));
        if (picked) {
          // Use robust file-part builder
          await appendPickedImage(fd, picked);
        }
        const created = await apiSend<Item>('/api/foods', 'POST', fd, true);
        setItems((arr) => [created, ...arr]);
      }
      setIsAdding(false);
      resetForm();
    } catch (e: any) {
      Alert.alert('Save failed', e?.message || 'Unable to save item');
    } finally {
      setSaving(false);
    }
  };

  // ===== Delete =====
  const remove = async (_id: string) => {
    try {
      await apiSend(`/api/foods/${_id}`, 'DELETE', {});
      setItems((arr) => arr.filter((x) => x._id !== _id));
    } catch (e: any) {
      Alert.alert('Delete failed', e?.message || 'Unable to delete');
    }
  };

  // 2-column card layout
  const rows = useMemo(() => {
    const r: Item[][] = [];
    for (let i = 0; i < items.length; i += 2) r.push(items.slice(i, i + 2));
    return r;
  }, [items]);

  return (
    <ScrollView contentContainerStyle={styles.page}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.h1}>Food Items</Text>
          <Text style={styles.muted}>Manage menu items and pricing</Text>
        </View>
        <Pressable
          style={styles.addBtn}
          onPress={openAdd}
        >
          <Feather
            name='plus'
            size={16}
            color='#fff'
          />
          <Text style={styles.addBtnText}> Add Food Item</Text>
        </Pressable>
      </View>

      {/* Loader */}
      {loading ? (
        <View style={{ paddingVertical: 40 }}>
          <ActivityIndicator size='large' />
        </View>
      ) : (
        <View style={{ gap: 16 }}>
          {rows.map((row, i) => (
            <View
              key={i}
              style={styles.row}
            >
              {row.map((item) => (
                <View
                  key={item._id}
                  style={styles.card}
                >
                  {/* Image */}
                  <View style={styles.imageBox}>
                    {item.imageUrl ? (
                      <Image
                        source={{ uri: item.imageUrl }}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode='cover'
                      />
                    ) : item.image ? (
                      <Image
                        source={item.image}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode='cover'
                      />
                    ) : (
                      <View style={styles.placeholderBox}>
                        <Feather
                          name='image'
                          size={28}
                          color='#9CA3AF'
                        />
                        <Text style={styles.placeholderText}>No image</Text>
                      </View>
                    )}
                  </View>

                  {/* Title + badge */}
                  <View style={styles.cardHeader}>
                    <View>
                      <Text style={styles.cardTitle}>{item.name}</Text>
                      <Text style={styles.cardDesc}>{item.category}</Text>
                    </View>
                    <View
                      style={[
                        styles.badge,
                        item.available ? styles.badgeOn : styles.badgeOff,
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeText,
                          item.available
                            ? styles.badgeTextOn
                            : styles.badgeTextOff,
                        ]}
                      >
                        {item.available ? 'Available' : 'Unavailable'}
                      </Text>
                    </View>
                  </View>

                  {/* Price + actions */}
                  <View style={styles.cardFooter}>
                    <Text style={styles.price}>
                      ฿{item.price}
                      <Text style={styles.inr}> INR {toINR(item.price)}</Text>
                    </Text>

                    <View style={styles.actions}>
                      <Pressable
                        style={styles.iconBtn}
                        onPress={() => openEdit(item)}
                      >
                        <Feather
                          name='edit-2'
                          size={18}
                        />
                      </Pressable>
                      <Pressable
                        style={styles.iconBtn}
                        onPress={() => remove(item._id)}
                      >
                        <Feather
                          name='trash-2'
                          size={18}
                        />
                      </Pressable>
                    </View>
                  </View>
                </View>
              ))}
              {row.length === 1 && <View style={{ flex: 1 }} />}
            </View>
          ))}
        </View>
      )}

      {/* Add/Edit modal */}
      <Modal
        transparent
        visible={isAdding}
        animationType='slide'
        onRequestClose={() => setIsAdding(false)}
      >
        <View style={styles.backdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {editing ? 'Edit Food Item' : 'Add New Food Item'}
            </Text>
            <Text style={styles.modalDesc}>Create a new menu item</Text>

            <View style={styles.formRow}>
              <View style={styles.field}>
                <Text style={styles.label}>Food Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder='Enter food name'
                  value={name}
                  onChangeText={setName}
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Price (฿)</Text>
                <TextInput
                  style={styles.input}
                  placeholder='0.00'
                  keyboardType='decimal-pad'
                  value={price}
                  onChangeText={setPrice}
                />
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={styles.field}>
                <Text style={styles.label}>Category</Text>
                <TextInput
                  style={styles.input}
                  placeholder='e.g., Snacks, Beverages'
                  value={category}
                  onChangeText={setCategory}
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Tax / VAT (%)</Text>
                <TextInput
                  style={styles.input}
                  placeholder='e.g., 5'
                  keyboardType='number-pad'
                  value={tax}
                  onChangeText={setTax}
                />
              </View>
            </View>

            <View style={[styles.formRow, { alignItems: 'center' }]}>
              <View
                style={[
                  styles.field,
                  { flexDirection: 'row', alignItems: 'center', gap: 10 },
                ]}
              >
                <RNSwitch
                  value={available}
                  onValueChange={setAvailable}
                />
                <Text style={styles.label}>Available</Text>
              </View>
            </View>

            {/* Upload area */}
            <View style={{ gap: 6 }}>
              <Text style={styles.label}>Food Image</Text>
              <Pressable
                style={styles.uploadBox}
                onPress={pickImage}
              >
                {picked ? (
                  <Image
                    source={{ uri: picked.uri }}
                    style={{ width: '100%', height: 160, borderRadius: 10 }}
                  />
                ) : (
                  <>
                    <Feather
                      name='upload'
                      size={28}
                      color='#6b7280'
                    />
                    <Text style={{ color: '#6b7280', marginTop: 6 }}>
                      Tap to upload or pick from gallery
                    </Text>
                    <Text style={{ color: '#9ca3af', fontSize: 12 }}>
                      PNG, JPG up to 10MB
                    </Text>
                  </>
                )}
              </Pressable>
            </View>

            <View style={styles.modalActions}>
              <Pressable
                onPress={() => {
                  setIsAdding(false);
                  resetForm();
                }}
                style={styles.btnOutline}
                disabled={saving}
              >
                <Text>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={save}
                style={styles.btnSolid}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator />
                ) : (
                  <Text style={{ color: 'white', fontWeight: '600' }}>
                    Save Item
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 16, paddingBottom: 32, gap: 16 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  h1: { fontSize: 24, fontWeight: '700' },
  muted: { color: '#6b7280' },

  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  addBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },

  row: { flexDirection: 'row', gap: 16 },
  card: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 3,
  },

  imageBox: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    overflow: 'hidden',
    aspectRatio: 1,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  cardDesc: { color: '#6b7280' },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeOn: { backgroundColor: '#10b98122', borderColor: '#10b98155' },
  badgeOff: { backgroundColor: '#e5e7eb', borderColor: '#d1d5db' },
  badgeText: { fontSize: 12, fontWeight: '600' },
  badgeTextOn: { color: '#065f46' },
  badgeTextOff: { color: '#374151' },

  cardFooter: {
    marginTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: { fontSize: 20, fontWeight: '700', color: '#111827' },
  inr: { marginLeft: 4, color: '#6b7280', fontSize: 12 },
  actions: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#d1d5db',
  },

  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  modalDesc: { color: '#6b7280' },

  formRow: { flexDirection: 'row', gap: 12 },
  field: { flex: 1, gap: 6 },
  label: { fontWeight: '600', color: '#374151' },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  uploadBox: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },

  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 6,
  },
  btnOutline: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: '#d1d5db',
  },
  btnSolid: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#111827',
    borderRadius: 10,
  },

  placeholderBox: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
  },
  placeholderText: { marginTop: 6, color: '#9CA3AF', fontSize: 12 },
});
