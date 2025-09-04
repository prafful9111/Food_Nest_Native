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
import AsyncStorage from '@react-native-async-storage/async-storage';

import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { KeyboardAvoidingView } from 'react-native';

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

  // NEW: raw materials / ingredients (optional)
  rawMaterials?: Array<{ name: string; qty?: number; unit?: string }>;

  // NEW: quantities
  totalQuantity?: { amount?: number; unit?: string };
  perServing?: { amount?: number; unit?: string };
};
type Cook = { _id: string; name?: string; email?: string };

// --- Cook Status list types ---
type ApiStatus = 'queued' | 'processing' | 'ready' | 'picked';
type UiStatus = 'Processing' | 'Ready' | 'Picked';

function apiToUiStatus(s: ApiStatus): UiStatus {
  if (s === 'ready') return 'Ready';
  if (s === 'picked') return 'Picked';
  return 'Processing'; // queued/processing -> Processing
}

type PrepReq = {
  _id: string;
  status: ApiStatus;
  quantityToPrepare?: number;
  cookId?: string;
  createdBy?: string;
  foodSnapshot?: {
    name?: string;
    perServing?: { amount?: number; unit?: string };
    imageUrl?: string | null;
    rawMaterials?: Array<{ name: string; qty?: number; unit?: string }>;
  };
  cook?: { _id: string; name?: string; email?: string };
};

const toINR = (thb: number) => Math.round(thb * 2.5);

export default function FoodItems() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [cooks, setCooks] = useState<Cook[]>([]);
  const [chosen, setChosen] = useState<Record<string, string>>({}); // foodId -> cookId
  const [sending, setSending] = useState<Record<string, boolean>>({}); // foodId -> loading
  // Cook Status section
  const [myRequests, setMyRequests] = useState<PrepReq[]>([]);
  const [reqLoading, setReqLoading] = useState(false);

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

  // NEW: raw materials (UI state uses strings for inputs)
  const [rawMaterials, setRawMaterials] = useState<
    Array<{ name: string; qty: string; unit: string }>
  >([{ name: '', qty: '', unit: '' }]);

  // NEW: quantities (amounts as strings for inputs)
  const [totalQty, setTotalQty] = useState<string>(''); // amount
  const [totalUnit, setTotalUnit] = useState<string>(''); // unit
  const [perServQty, setPerServQty] = useState<string>(''); // amount
  const [perServUnit, setPerServUnit] = useState<string>(''); // unit

  function addRawMaterialRow() {
    setRawMaterials((arr) => [...arr, { name: '', qty: '', unit: '' }]);
  }
  function removeRawMaterialRow(idx: number) {
    setRawMaterials((arr) => arr.filter((_, i) => i !== idx));
  }
  function updateRawMaterial(
    idx: number,
    key: 'name' | 'qty' | 'unit',
    val: string
  ) {
    setRawMaterials((arr) => {
      const next = [...arr];
      next[idx] = { ...next[idx], [key]: val };
      return next;
    });
  }

  const resetForm = () => {
    setEditing(null);
    setName('');
    setPrice('');
    setCategory('');
    setTax('');
    setAvailable(true);
    setPicked(null);
    // NEW
    setRawMaterials([{ name: '', qty: '', unit: '' }]);
    // NEW: reset quantities
    setTotalQty('');
    setTotalUnit('');
    setPerServQty('');
    setPerServUnit('');
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

    // NEW: prefill raw materials if present
    if (it.rawMaterials && it.rawMaterials.length) {
      setRawMaterials(
        it.rawMaterials.map((r) => ({
          name: r.name || '',
          qty: r.qty !== undefined && r.qty !== null ? String(r.qty) : '',
          unit: r.unit || '',
        }))
      );
    } else {
      setRawMaterials([{ name: '', qty: '', unit: '' }]);
    }

    // NEW: prefill quantities
    setTotalQty(
      it.totalQuantity?.amount != null ? String(it.totalQuantity.amount) : ''
    );
    setTotalUnit(it.totalQuantity?.unit || '');
    setPerServQty(
      it.perServing?.amount != null ? String(it.perServing.amount) : ''
    );
    setPerServUnit(it.perServing?.unit || '');

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

  // ===== Current user id (supervisor) for filtering requests =====
  async function getUserId(): Promise<string> {
    // first try a simple key
    const byKey = (await AsyncStorage.getItem('userId')) || '';
    if (byKey) return byKey;

    // fallback to stored user object
    try {
      const user = JSON.parse((await AsyncStorage.getItem('user')) || '{}');
      return user?._id || user?.id || '';
    } catch {
      return '';
    }
  }

  // ===== API helpers =====

  // Always return a clean string-to-string map (no undefined values)
  type HeadersDict = Record<string, string>;

  async function buildAuthHeaders(): Promise<HeadersDict> {
    const token = await AsyncStorage.getItem('token'); // <-- if you saved as 'accessToken', change this key
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  }

  async function apiGet<T>(path: string): Promise<T> {
    // Build a real Headers object to satisfy TS + fetch
    const auth = await buildAuthHeaders();
    const headers = new Headers(auth);

    const r = await fetch(`${API_URL}${path}`, { headers });
    if (!r.ok) throw new Error(await r.text());
    return (await r.json()) as T;
  }

  async function apiSend<T>(
    path: string,
    method: string,
    body: any,
    isForm = false
  ): Promise<T> {
    const auth = await buildAuthHeaders();
    const headers = new Headers(auth);

    // For JSON requests, set the content-type; for form-data, let fetch set it (boundary)
    if (!isForm) headers.set('Content-Type', 'application/json');

    const r = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: isForm ? body : JSON.stringify(body),
    });
    if (!r.ok) throw new Error(await r.text());
    return (await r.json()) as T;
  }

  // ===== Load my created prep-requests for "Cook Status" =====
  async function loadMyRequests() {
    setReqLoading(true);
    try {
      const me = await getUserId();
      if (!me) {
        setMyRequests([]);
        return;
      }
      // Prefer server-side filter by creator:
      // GET /api/prep-requests?createdBy=<me>
      const rows = await apiGet<PrepReq[]>(
        `/api/prep-requests?createdBy=${encodeURIComponent(me)}`
      );
      setMyRequests(rows);
    } catch (e) {
      console.warn('loadMyRequests failed', e);
      setMyRequests([]);
    } finally {
      setReqLoading(false);
    }
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

  useEffect(() => {
    (async () => {
      try {
        const list = await apiGet<Cook[]>('/api/users?role=cook');
        setCooks(list);
      } catch (e) {
        console.warn('Load cooks failed', e);
        setCooks([]);
      }
    })();
  }, []);

  // Load the "Cook Status" list on mount and poll every 10s
  useEffect(() => {
    loadMyRequests();
    const t = setInterval(loadMyRequests, 10000);
    return () => clearInterval(t);
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

  async function appendPickedImage(
    fd: FormData,
    picked: {
      uri: string;
      type?: string;
      name?: string;
      mimeType?: string;
      fileName?: string;
    }
  ) {
    if (!picked) return;

    // build a solid name/type using your existing logic
    const part = toFilePart(picked); // returns { uri, name, type }

    if (Platform.OS === 'web') {
      const resp = await fetch(part.uri);
      const blob = await resp.blob();
      // Some browsers need a File to keep the filename
      const file = new File([blob], part.name, {
        type: part.type || blob.type || 'image/jpeg',
      });
      fd.append('image', file);
    } else {
      // iOS/Android RN style
      fd.append('image', part as any);
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

    // NEW: build clean rawMaterials (name required; qty optional number; unit optional)
    const cleanRawMaterials = rawMaterials
      .map((r) => ({
        name: r.name.trim(),
        qty: r.qty.trim(),
        unit: r.unit.trim(),
      }))
      .filter((r) => r.name.length > 0)
      .map((r) => ({
        name: r.name,
        qty: r.qty === '' ? undefined : Number(r.qty),
        unit: r.unit || undefined,
      }));

    // NEW: build quantities payloads (send only if amount is provided)
    const totalQuantityPayload =
      totalQty.trim() === ''
        ? undefined
        : {
            amount: Number(totalQty),
            unit: totalUnit.trim() || undefined,
          };

    const perServingPayload =
      perServQty.trim() === ''
        ? undefined
        : {
            amount: Number(perServQty),
            unit: perServUnit.trim() || undefined,
          };

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
          // NEW: include rawMaterials in multipart
          fd.append('rawMaterials', JSON.stringify(cleanRawMaterials));
          // NEW: include quantities in multipart if present
          if (totalQuantityPayload) {
            fd.append('totalQuantity', JSON.stringify(totalQuantityPayload));
          }
          if (perServingPayload) {
            fd.append('perServing', JSON.stringify(perServingPayload));
          }
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
            // NEW
            rawMaterials: cleanRawMaterials,
            ...(totalQuantityPayload
              ? { totalQuantity: totalQuantityPayload }
              : {}),
            ...(perServingPayload ? { perServing: perServingPayload } : {}),
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
        // NEW: include rawMaterials in multipart
        fd.append('rawMaterials', JSON.stringify(cleanRawMaterials));
        // NEW: include quantities in multipart if present
        if (totalQuantityPayload) {
          fd.append('totalQuantity', JSON.stringify(totalQuantityPayload));
        }
        if (perServingPayload) {
          fd.append('perServing', JSON.stringify(perServingPayload));
        }
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

  // ===== Assign to cook =====
  const setChoice = (foodId: string, cookId: string) =>
    setChosen((prev) => ({ ...prev, [foodId]: cookId }));

  async function sendPrepRequest(food: Item) {
    const cookId = chosen[food._id];
    if (!cookId) {
      Alert.alert('Pick a cook first');
      return;
    }
    setSending((s) => ({ ...s, [food._id]: true }));
    try {
      await apiSend('/api/prep-requests', 'POST', {
        foodId: food._id,
        cookId,
        // if you want to pass a quantity, use your existing field; otherwise 0:
        quantityToPrepare: food.totalQuantity?.amount ?? 0,
      });
      Alert.alert('Sent', 'Request forwarded to cook');
      // Immediately refresh the Cook Status section so this shows up
      await loadMyRequests();
    } catch (e: any) {
      Alert.alert('Failed', e?.message || 'Could not send');
    } finally {
      setSending((s) => ({ ...s, [food._id]: false }));
    }
  }

  // 2-column card layout

  return (
    <ScrollView contentContainerStyle={styles.page}>
      {/* Header */}
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.h1}>Today's Menu</Text>
          <Text style={styles.muted}>
            Set raw material quantity & assign chefs
          </Text>
          <Pressable
      onPress={loadMyRequests}
      style={[styles.iconBtn, { alignSelf: 'flex-start', marginTop: 6 }]}
    >
      <Text style={{ fontWeight: '700' }}>Refresh Cook Status</Text>
    </Pressable>


          <Pressable
            onPress={openAdd}
            style={[styles.addBtn, styles.addBtnUnder]}
          >
            <LinearGradient
              colors={['#FDE047', '#F59E0B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.addBtnGrad}
            >
              <Feather
                name='plus'
                size={16}
                color='#ffffff'
              />
              <Text style={styles.addBtnTextYellow}> Add Food Item</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </View>

      {/* Loader */}
      {loading ? (
        <View style={{ paddingVertical: 40 }}>
          <ActivityIndicator size='large' />
        </View>
      ) : (
        <View style={{ gap: 16 }}>
          {items.map((item) => (
            <View
              key={item._id}
              style={styles.cardRow}
            >
              {/* Image (square thumb) */}
              <View style={styles.thumbBox}>
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

              {/* Middle content */}
              <View style={styles.cardBody}>
                <View style={styles.cardHeaderRow}>
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

                {/* NEW: Raw materials */}
                {Array.isArray(item.rawMaterials) &&
                  item.rawMaterials.length > 0 && (
                    <View style={{ marginTop: 6 }}>
                      <Text style={styles.rmLabel}>Raw materials</Text>
                      <Text
                        style={styles.rmText}
                        numberOfLines={2}
                      >
                        {item.rawMaterials
                          .map(
                            (r) =>
                              `${r.name}${
                                r.qty != null
                                  ? ` (${r.qty}${r.unit ? ' ' + r.unit : ''})`
                                  : ''
                              }`
                          )
                          .join(', ')}
                      </Text>
                    </View>
                  )}

                {/* Price + actions */}
                <View style={styles.cardFooterRow}>
                  <Text style={styles.price}>
                    ฿{item.price}
                    <Text style={styles.inr}>
                      {' '}
                      INR {Math.round(item.price * 2.5)}
                    </Text>
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
                {/* Assign to Cook */}
                <View style={{ marginTop: 10, gap: 8 }}>
                  <Text style={{ fontSize: 12, color: '#374151' }}>
                    Assign cook
                  </Text>

                  {/* horizontal chips as a simple dropdown substitute */}
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: 8 }}
                  >
                    {cooks.map((c) => (
                      <Pressable
                        key={c._id}
                        onPress={() => setChoice(item._id, c._id)}
                        style={[
                          {
                            paddingVertical: 6,
                            paddingHorizontal: 10,
                            borderRadius: 8,
                            borderWidth: 1,
                            borderColor: '#e5e7eb',
                          },
                          chosen[item._id] === c._id && {
                            backgroundColor: '#111827',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            {
                              fontSize: 12,
                              fontWeight: '700',
                              color: '#374151',
                            },
                            chosen[item._id] === c._id && { color: '#fff' },
                          ]}
                        >
                          {c.name || c.email}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>

                  <Pressable
                    onPress={() => sendPrepRequest(item)}
                    style={[
                      styles.iconBtn,
                      {
                        alignSelf: 'flex-start',
                        backgroundColor: '#111827',
                        borderColor: '#111827',
                      },
                    ]}
                    disabled={!!sending[item._id]}
                  >
                    {sending[item._id] ? (
                      <ActivityIndicator color='#fff' />
                    ) : (
                      <Text style={{ color: '#fff', fontWeight: '700' }}>
                        Send
                      </Text>
                    )}
                  </Pressable>
                </View>
              </View>
            </View>
          ))}
          {/* ---------- Cook Status (requests sent by this supervisor) ---------- */}
<View style={{ marginTop: 14, gap: 10 }}>
  <Text style={{ fontSize: 18, fontWeight: '700' }}>Cook Status</Text>

  {reqLoading && myRequests.length === 0 ? (
    <View style={{ paddingVertical: 20 }}>
      <ActivityIndicator />
    </View>
  ) : myRequests.length === 0 ? (
    <Text style={{ color: '#6b7280' }}>
      No requests sent yet. Assign a cook to see updates here.
    </Text>
  ) : (
    myRequests.map(req => {
      const ui: UiStatus = apiToUiStatus(req.status);
      const cookObj = cooks.find(c => c._id === req.cookId);
      const cookLabel = cookObj?.name || cookObj?.email || `Cook ${req.cookId ?? ''}`;
      
      return (
        <View
          key={req._id}
          style={{
            backgroundColor: 'white',
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#e5e7eb',
            padding: 12,
            gap: 8
          }}
        >
          {/* Top row: food name + status pill */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 16, fontWeight: '700' }}>
              {req.foodSnapshot?.name ?? 'Item'}
            </Text>

            <View
              style={{
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 999,
                backgroundColor:
                  ui === 'Ready' ? '#DCFCE7' :
                  ui === 'Picked' ? '#E0E7FF' : '#FEF3C7'
              }}
            >
              <Text style={{
                fontSize: 12,
                fontWeight: '800',
                color:
                  ui === 'Ready' ? '#166534' :
                  ui === 'Picked' ? '#3730A3' : '#92400E'
              }}>
                {ui === 'Processing' ? 'Start preparing' : ui}
              </Text>
            </View>
          </View>

          {/* Cook + qty */}
          <Text style={{ color: '#374151' }}>
            Cook: <Text style={{ fontWeight: '700' }}>{cookLabel}</Text>
            {typeof req.quantityToPrepare === 'number' ? `  •  Qty: ${req.quantityToPrepare}` : ''}
          </Text>

          {/* Per-serving + materials (compact) */}
          {req.foodSnapshot?.perServing?.amount != null && (
            <Text style={{ color: '#6b7280' }}>
              Per serving: {req.foodSnapshot.perServing.amount}
              {req.foodSnapshot.perServing.unit ? ` ${req.foodSnapshot.perServing.unit}` : ''}
            </Text>
          )}

          {Array.isArray(req.foodSnapshot?.rawMaterials) &&
            req.foodSnapshot!.rawMaterials!.length > 0 && (
            <Text style={{ color: '#6b7280' }} numberOfLines={2}>
              Materials: {req.foodSnapshot!.rawMaterials!
                .map(r => `${r.name}${r.qty != null ? ` (${r.qty}${r.unit ? ' '+r.unit : ''})` : ''}`)
                .join(', ')}
            </Text>
          )}
        </View>
      );
    })
  )}
</View>

        </View>
      )}

      {/* Add/Edit modal */}
      {/* Add/Edit modal */}
      <Modal
        transparent
        visible={isAdding}
        animationType='slide'
        onRequestClose={() => setIsAdding(false)}
      >
        <View style={styles.backdrop}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalCard}
          >
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editing ? 'Edit Food Item' : 'Add New Food Item'}
              </Text>
              <Text style={styles.modalDesc}>Create a new menu item</Text>
            </View>

            {/* Scrollable form */}
            <ScrollView
              style={styles.modalScroll}
              contentContainerStyle={styles.modalContent}
              keyboardShouldPersistTaps='handled'
              nestedScrollEnabled
            >
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

              {/* Raw Materials (Supervisor: Name + Qty + Unit) */}
              <View style={{ gap: 6, marginTop: 8 }}>
                <Text style={styles.label}>Raw Materials / Ingredients</Text>

                {rawMaterials.map((rm, idx) => (
                  <View
                    key={idx}
                    style={[styles.formRow, { alignItems: 'center' }]}
                  >
                    <View style={[styles.field, { flex: 1.2 }]}>
                      <Text style={styles.label}>Name</Text>
                      <TextInput
                        style={styles.input}
                        placeholder='e.g., Poha, Oil, Peanuts'
                        value={rm.name}
                        onChangeText={(v) => updateRawMaterial(idx, 'name', v)}
                      />
                    </View>
                    <View style={[styles.field, { flex: 0.6 }]}>
                      <Text style={styles.label}>Qty</Text>
                      <TextInput
                        style={styles.input}
                        placeholder='e.g., 0.5'
                        keyboardType='decimal-pad'
                        value={rm.qty}
                        onChangeText={(v) => updateRawMaterial(idx, 'qty', v)}
                      />
                    </View>
                    <View style={[styles.field, { flex: 0.7 }]}>
                      <Text style={styles.label}>Unit</Text>
                      <TextInput
                        style={styles.input}
                        placeholder='e.g., kg, g, ml, tbsp'
                        value={rm.unit}
                        onChangeText={(v) => updateRawMaterial(idx, 'unit', v)}
                      />
                    </View>

                    <Pressable
                      onPress={() => removeRawMaterialRow(idx)}
                      style={[styles.iconBtn, { marginTop: 24 }]}
                    >
                      <Feather
                        name='minus'
                        size={18}
                      />
                    </Pressable>
                  </View>
                ))}

                <View
                  style={{ flexDirection: 'row', justifyContent: 'flex-start' }}
                >
                  <Pressable
                    onPress={addRawMaterialRow}
                    style={styles.iconBtn}
                  >
                    <Feather
                      name='plus'
                      size={18}
                    />
                  </Pressable>
                  <Text
                    style={{
                      alignSelf: 'center',
                      marginLeft: 8,
                      color: '#6b7280',
                    }}
                  >
                    Add another material
                  </Text>
                </View>
              </View>

              {/* NEW: Quantities */}
              <View style={{ gap: 6, marginTop: 8 }}>
                <Text style={styles.label}>Quantities</Text>

                {/* Total quantity */}
                <View style={[styles.formRow, { alignItems: 'center' }]}>
                  <View style={[styles.field, { flex: 0.8 }]}>
                    <Text style={styles.label}>Total Quantity</Text>
                    <TextInput
                      style={styles.input}
                      placeholder='e.g., 5'
                      keyboardType='decimal-pad'
                      value={totalQty}
                      onChangeText={setTotalQty}
                    />
                  </View>
                  <View style={[styles.field, { flex: 0.8 }]}>
                    <Text style={styles.label}>Unit</Text>
                    <TextInput
                      style={styles.input}
                      placeholder='e.g., kg, g, L, ml, pcs'
                      value={totalUnit}
                      onChangeText={setTotalUnit}
                    />
                  </View>
                </View>

                {/* Per serving quantity */}
                <View style={[styles.formRow, { alignItems: 'center' }]}>
                  <View style={[styles.field, { flex: 0.8 }]}>
                    <Text style={styles.label}>Per Serving Quantity</Text>
                    <TextInput
                      style={styles.input}
                      placeholder='e.g., 0.15'
                      keyboardType='decimal-pad'
                      value={perServQty}
                      onChangeText={setPerServQty}
                    />
                  </View>
                  <View style={[styles.field, { flex: 0.8 }]}>
                    <Text style={styles.label}>Unit</Text>
                    <TextInput
                      style={styles.input}
                      placeholder='e.g., kg, g, L, ml, pcs'
                      value={perServUnit}
                      onChangeText={setPerServUnit}
                    />
                  </View>
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
            </ScrollView>

            {/* Pinned footer */}
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
          </KeyboardAvoidingView>
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
  muted: { color: '#6b7280', paddingTop: 6 },

  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },

  addBtnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    // optional: subtle shadow
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 3,
  },

  addBtnTextYellow: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
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
    maxHeight: '86%',
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

  cardRow: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 3,
  },

  thumbBox: {
    width: 84,
    height: 84,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f3f4f6',
  },

  cardBody: {
    flex: 1,
    minHeight: 84,
  },

  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  cardFooterRow: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  rmLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    opacity: 0.8,
  },

  rmText: {
    color: '#6b7280',
    marginTop: 2,
  },

  modalHeader: { marginBottom: 4 },
  modalScroll: {},
  modalContent: { gap: 12, paddingBottom: 8 },
  addBtnUnder: {
    alignSelf: 'flex-start',
    marginTop: 5,
  },
});
