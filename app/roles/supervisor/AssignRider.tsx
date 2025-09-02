// screens/AssignRider.tsx
import React, { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from "expo-linear-gradient";


/* ---------- Types ---------- */
type Rider = {
  id: number;
  name: string;
  status: 'Available' | 'Active' | 'Off Duty';
  route: string;
};
type Vehicle = {
  id: number;
  registration: string;
  type: 'Cart' | 'Bike';
  status: 'Available' | 'In Use' | 'Maintenance';
};
type Route = {
  id: number;
  name: string;
  stops: number;
  status: 'Available' | 'Assigned';
};
type Battery = {
  id: number;
  imei: string;
  vehicle?: string; // optional link to a vehicle registration
  status: 'Excellent' | 'Good' | 'Low';
  charge: string; // e.g., "85%"
  health: string; // e.g., "98%"
  lastCharge?: string;
};
type FoodItem = { id: number; name: string; available: number };
type FoodPick = { name: string; quantity: number };
type Assignment = {
  id: number;
  rider: string;
  vehicle: string;
  battery: string; // IMEI or short label
  route: string;
  foodItems: FoodPick[];
  assignedDate: string;
  status: 'Active' | 'Completed';
};

/* ---------- Sample data (parity with web + batteries) ---------- */
const riders: Rider[] = [
  { id: 1, name: 'Mike Rodriguez', status: 'Available', route: 'None' },
  { id: 2, name: 'Sarah Chen', status: 'Available', route: 'None' },
  { id: 3, name: 'James Wilson', status: 'Active', route: 'Downtown Route A' },
  { id: 4, name: 'Emily Davis', status: 'Available', route: 'None' },
];

const vehicles: Vehicle[] = [
  { id: 1, registration: 'FC-001', type: 'Cart', status: 'Available' },
  { id: 2, registration: 'FC-002', type: 'Cart', status: 'Available' },
  { id: 3, registration: 'FC-003', type: 'Cart', status: 'In Use' },
  { id: 4, registration: 'FC-004', type: 'Bike', status: 'Available' },
];

const routes: Route[] = [
  { id: 1, name: 'Downtown Route A', stops: 5, status: 'Available' },
  { id: 2, name: 'Suburban Route B', stops: 4, status: 'Available' },
  { id: 3, name: 'Beach Route C', stops: 6, status: 'Available' },
];

const batteries: Battery[] = [
  {
    id: 1,
    imei: '356938035643809',
    vehicle: 'FC-001',
    status: 'Good',
    charge: '85%',
    health: '98%',
    lastCharge: '2h ago',
  },
  {
    id: 2,
    imei: '356938035643810',
    vehicle: 'FC-002',
    status: 'Low',
    charge: '20%',
    health: '75%',
    lastCharge: '8h ago',
  },
  {
    id: 3,
    imei: '356938035643811',
    vehicle: 'FC-003',
    status: 'Excellent',
    charge: '92%',
    health: '100%',
    lastCharge: '1h ago',
  },
  {
    id: 4,
    imei: '356938035643812',
    vehicle: 'FC-004',
    status: 'Good',
    charge: '67%',
    health: '89%',
    lastCharge: '4h ago',
  },
];

const foodItems: FoodItem[] = [
  { id: 1, name: 'Poha', available: 50 },
  { id: 2, name: 'Vada Pav', available: 30 },
  { id: 3, name: 'Chai', available: 100 },
  { id: 4, name: 'Water Bottle', available: 75 },
];

const initialAssignments: Assignment[] = [
  {
    id: 1,
    rider: 'James Wilson',
    vehicle: 'FC-003',
    battery: '356938035643811',
    route: 'Downtown Route A',
    foodItems: [
      { name: 'Poha', quantity: 20 },
      { name: 'Chai', quantity: 30 },
    ],
    assignedDate: '2024-01-15',
    status: 'Active',
  },
];

/* ---------- Small Badge ---------- */
function Badge({
  text,
  variant = 'solid',
  color = '#2563eb',
}: {
  text: string;
  variant?: 'solid' | 'outline';
  color?: string;
}) {
  const solid = variant === 'solid';
  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: solid ? color : 'transparent',
          borderColor: color,
        },
      ]}
    >
      <Text
        style={{
          color: solid ? '#fff' : color,
          fontSize: 11,
          fontWeight: '700',
        }}
      >
        {text}
      </Text>
    </View>
  );
}

/* ---------- Bottom-sheet style picker ---------- */
function PickerSheet<T extends { id: number } & Record<string, any>>({
  visible,
  onClose,
  title,
  items,
  renderLeft,
  renderRight,
  onSelect,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  items: T[];
  renderLeft: (o: T) => React.ReactNode;
  renderRight?: (o: T) => React.ReactNode;
  onSelect: (o: T) => void;
}) {
  return (
    <Modal
      transparent
      animationType='slide'
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable
        style={styles.sheetBackdrop}
        onPress={onClose}
      />
      <View style={styles.sheet}>
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>{title}</Text>
          <Pressable onPress={onClose}>
            <Feather
              name='x'
              size={20}
            />
          </Pressable>
        </View>
        <ScrollView>
          {items.map((o) => (
            <Pressable
              key={o.id}
              style={styles.optionRow}
              onPress={() => {
                onSelect(o);
                onClose();
              }}
            >
              <View
                style={[styles.row, { alignItems: 'center', gap: 10, flex: 1 }]}
              >
                {renderLeft(o)}
              </View>
              <View>{renderRight ? renderRight(o) : null}</View>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

/* ---------- Main Screen ---------- */
export default function AssignRiderScreen() {
  const [assignments, setAssignments] =
    useState<Assignment[]>(initialAssignments);

  // Modal open
  const [isOpen, setIsOpen] = useState(false);

  // Selections
  const [selectedRider, setSelectedRider] = useState<Rider | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [selectedBattery, setSelectedBattery] = useState<Battery | null>(null);

  // Food selection
  const [selectedFoodItems, setSelectedFoodItems] = useState<FoodPick[]>([]);
  const [foodPickerOpen, setFoodPickerOpen] = useState(false);
  const [currentFoodItem, setCurrentFoodItem] = useState<FoodItem | null>(null);
  const [currentQuantity, setCurrentQuantity] = useState<string>('');

  // Picker toggles
  const [riderOpen, setRiderOpen] = useState(false);
  const [vehicleOpen, setVehicleOpen] = useState(false);
  const [routeOpen, setRouteOpen] = useState(false);
  const [batteryOpen, setBatteryOpen] = useState(false);

  const availableRiders = useMemo(
    () => riders.filter((r) => r.status === 'Available'),
    []
  );
  const availableVehicles = useMemo(
    () => vehicles.filter((v) => v.status === 'Available'),
    []
  );
  const remainingFoodOptions = useMemo(
    () =>
      foodItems.filter(
        (fi) => !selectedFoodItems.find((s) => s.name === fi.name)
      ),
    [selectedFoodItems]
  );
  // Batteries: you can filter here, e.g. exclude "Low" if you want
  const availableBatteries = useMemo(() => batteries, []);

  const canCreate =
    !!selectedRider &&
    !!selectedVehicle &&
    !!selectedBattery && // battery required
    !!selectedRoute &&
    selectedFoodItems.length > 0;

  const totalItems = useMemo(
    () => selectedFoodItems.reduce((sum, i) => sum + i.quantity, 0),
    [selectedFoodItems]
  );

  const resetModal = () => {
    setSelectedRider(null);
    setSelectedVehicle(null);
    setSelectedBattery(null);
    setSelectedRoute(null);
    setSelectedFoodItems([]);
    setCurrentFoodItem(null);
    setCurrentQuantity('');
  };

  const addFoodItem = () => {
    if (!currentFoodItem) return Alert.alert('Select an item');
    const qty = Math.max(
      0,
      Math.min(
        Number(currentQuantity.replace(/[^\d]/g, '')) || 0,
        currentFoodItem.available
      )
    );
    if (!qty) return Alert.alert('Enter a valid quantity');
    if (selectedFoodItems.find((s) => s.name === currentFoodItem.name)) {
      return Alert.alert('Item already added');
    }
    setSelectedFoodItems((prev) => [
      ...prev,
      { name: currentFoodItem.name, quantity: qty },
    ]);
    setCurrentFoodItem(null);
    setCurrentQuantity('');
  };

  const removeFoodItem = (name: string) => {
    setSelectedFoodItems((prev) => prev.filter((f) => f.name !== name));
  };

  const createAssignment = () => {
    if (!canCreate) return;
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    const newAssignment: Assignment = {
      id: assignments.length
        ? Math.max(...assignments.map((a) => a.id)) + 1
        : 1,
      rider: selectedRider!.name,
      vehicle: selectedVehicle!.registration,
      battery: selectedBattery!.imei,
      route: selectedRoute!.name,
      foodItems: selectedFoodItems,
      assignedDate: `${y}-${m}-${d}`,
      status: 'Active',
    };
    setAssignments((prev) => [newAssignment, ...prev]);
    setIsOpen(false);
    resetModal();
    Alert.alert(
      'Assignment Created',
      'Rider, vehicle, battery, route and items assigned successfully.'
    );
  };

  const batteryStatusDot = (status: Battery['status']) => {
    const bg =
      status === 'Excellent'
        ? '#16a34a'
        : status === 'Good'
        ? '#2563eb'
        : '#dc2626';
    return <View style={[styles.badgeDot, { backgroundColor: bg }]} />;
  };

  return (
    <ScrollView contentContainerStyle={styles.page}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.h1}>Rider Assignment</Text>
          <Text style={styles.subtle}>
            Assign riders to vehicles, batteries, routes, and food inventory
          </Text>
        </View>
      </View>

      {/* New actions row for the button */}
      <View style={styles.actionsRow}>
        {/* (we’ll replace this Pressable with a gradient below) */}
        <Pressable onPress={() => setIsOpen(true)}>
          <LinearGradient
            colors={['#FDE047', '#F59E0B']} // yellow → amber
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientBtn} // new style below
          >
            <Feather
              name='plus'
              size={16}
              color='#ffffff'
              style={{ marginRight: 8 }}
            />
            <Text style={styles.gradientBtnText}>New Assignment</Text>
          </LinearGradient>
        </Pressable>
      </View>

      {/* Current Assignments */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Current Assignments</Text>
        <Text style={styles.subtle}>
          Active rider assignments and their details
        </Text>

        <View style={{ height: 12 }} />
        <View style={{ rowGap: 12 }}>
          {assignments.map((a) => (
            <View
              key={a.id}
              style={styles.assignmentCard}
            >
              <View style={[styles.rowBetween, { marginBottom: 8 }]}>
                <View style={[styles.row, { alignItems: 'center', gap: 10 }]}>
                  <Badge
                    text={a.status}
                    color={a.status === 'Active' ? '#16a34a' : '#6b7280'}
                    variant='solid'
                  />
                  <Text style={{ fontWeight: '700', color: '#111827' }}>
                    {a.rider}
                  </Text>
                </View>
                <Text style={styles.subtleSmall}>
                  Assigned: {a.assignedDate}
                </Text>
              </View>

              <View style={styles.assignmentGrid}>
                <Text>
                  <Text style={styles.bold}>Vehicle:</Text> {a.vehicle}
                </Text>
                <Text>
                  <Text style={styles.bold}>Battery:</Text> {a.battery}
                </Text>
                <Text>
                  <Text style={styles.bold}>Route:</Text> {a.route}
                </Text>
                <Text>
                  <Text style={styles.bold}>Items:</Text> {a.foodItems.length}{' '}
                  items
                </Text>
              </View>

              <View style={styles.chipsWrap}>
                {a.foodItems.map((fi, idx) => (
                  <View
                    key={`${fi.name}-${idx}`}
                    style={styles.chip}
                  >
                    <Text style={styles.chipText}>
                      {fi.name}: {fi.quantity}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* New Assignment Modal */}
      <Modal
        transparent
        animationType='slide'
        visible={isOpen}
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setIsOpen(false)}
        />
        <View style={styles.modalCard}>
          <View style={[styles.rowBetween, { marginBottom: 10 }]}>
            <View>
              <Text style={styles.modalTitle}>Create Rider Assignment</Text>
              <Text style={styles.subtleSmall}>
                Assign a rider to a vehicle, battery, route, and food inventory
              </Text>
            </View>
            <Pressable onPress={() => setIsOpen(false)}>
              <Feather
                name='x'
                size={22}
              />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={{ paddingBottom: 12 }}>
            {/* Rider + Vehicle */}
            <View style={styles.grid2}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Select Rider</Text>
                <Pressable
                  style={styles.inputLike}
                  onPress={() => setRiderOpen(true)}
                >
                  <Text
                    style={
                      selectedRider
                        ? styles.inputValue
                        : styles.inputPlaceholder
                    }
                  >
                    {selectedRider
                      ? `${selectedRider.name} - ${selectedRider.status}`
                      : 'Choose rider'}
                  </Text>
                  <Feather
                    name='chevron-down'
                    size={18}
                    color='#6b7280'
                  />
                </Pressable>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Select Vehicle</Text>
                <Pressable
                  style={styles.inputLike}
                  onPress={() => setVehicleOpen(true)}
                >
                  <Text
                    style={
                      selectedVehicle
                        ? styles.inputValue
                        : styles.inputPlaceholder
                    }
                  >
                    {selectedVehicle
                      ? `${selectedVehicle.registration} - ${selectedVehicle.type}`
                      : 'Choose vehicle'}
                  </Text>
                  <Feather
                    name='chevron-down'
                    size={18}
                    color='#6b7280'
                  />
                </Pressable>
              </View>
            </View>

            {/* Battery */}
            <View style={{ marginTop: 10 }}>
              <Text style={styles.label}>Select Battery</Text>
              <Pressable
                style={styles.inputLike}
                onPress={() => setBatteryOpen(true)}
              >
                <Text
                  style={
                    selectedBattery
                      ? styles.inputValue
                      : styles.inputPlaceholder
                  }
                >
                  {selectedBattery
                    ? `${selectedBattery.imei} • ${selectedBattery.charge} • ${selectedBattery.health}`
                    : 'Choose battery'}
                </Text>
                <Feather
                  name='chevron-down'
                  size={18}
                  color='#6b7280'
                />
              </Pressable>
            </View>

            {/* Route */}
            <View style={{ marginTop: 10 }}>
              <Text style={styles.label}>Select Route</Text>
              <Pressable
                style={styles.inputLike}
                onPress={() => setRouteOpen(true)}
              >
                <Text
                  style={
                    selectedRoute ? styles.inputValue : styles.inputPlaceholder
                  }
                >
                  {selectedRoute
                    ? `${selectedRoute.name} - ${selectedRoute.stops} stops`
                    : 'Choose route'}
                </Text>
                <Feather
                  name='chevron-down'
                  size={18}
                  color='#6b7280'
                />
              </Pressable>
            </View>

            {/* Assign Food Items */}
            <View style={{ marginTop: 14 }}>
              <Text style={styles.label}>Assign Food Items</Text>
              <View style={[styles.row, { alignItems: 'center', gap: 8 }]}>
                <Pressable
                  style={[styles.inputLike, { flex: 1 }]}
                  onPress={() => setFoodPickerOpen(true)}
                >
                  <Text
                    style={
                      currentFoodItem
                        ? styles.inputValue
                        : styles.inputPlaceholder
                    }
                  >
                    {currentFoodItem
                      ? `${currentFoodItem.name} (Available: ${currentFoodItem.available})`
                      : 'Select food item'}
                  </Text>
                  <Feather
                    name='chevron-down'
                    size={18}
                    color='#6b7280'
                  />
                </Pressable>
                <TextInput
                  style={[styles.qtyInput, { width: 80 }]}
                  placeholder='Qty'
                  keyboardType='number-pad'
                  value={currentQuantity}
                  onChangeText={(t) =>
                    setCurrentQuantity(t.replace(/[^\d]/g, ''))
                  }
                />
                <Pressable
                  style={styles.outlineBtn}
                  onPress={addFoodItem}
                >
                  <Feather
                    name='plus'
                    size={16}
                  />
                </Pressable>
              </View>

              {selectedFoodItems.length > 0 && (
                <View style={{ marginTop: 10 }}>
                  <Text style={styles.label}>Selected Items</Text>
                  <View style={{ rowGap: 8 }}>
                    {selectedFoodItems.map((fi) => (
                      <View
                        key={fi.name}
                        style={styles.selectedRow}
                      >
                        <Text>
                          {fi.name} - Qty: {fi.quantity}
                        </Text>
                        <Pressable
                          onPress={() => removeFoodItem(fi.name)}
                          style={styles.iconBtn}
                        >
                          <Feather
                            name='x'
                            size={16}
                          />
                        </Pressable>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>

            {/* Summary (only when complete) */}
            {selectedRider &&
              selectedVehicle &&
              selectedBattery &&
              selectedRoute &&
              selectedFoodItems.length > 0 && (
                <View
                  style={{
                    marginTop: 12,
                    paddingTop: 12,
                    borderTopWidth: 1,
                    borderTopColor: '#eef1f5',
                  }}
                >
                  <Text style={styles.label}>Assignment Summary</Text>
                  <View style={{ rowGap: 6, marginTop: 6 }}>
                    <View
                      style={[styles.row, { alignItems: 'center', gap: 8 }]}
                    >
                      <Feather
                        name='user-check'
                        size={16}
                      />
                      <Text>Rider: {selectedRider.name}</Text>
                    </View>
                    <View
                      style={[styles.row, { alignItems: 'center', gap: 8 }]}
                    >
                      <Feather
                        name='truck'
                        size={16}
                      />
                      <Text>Vehicle: {selectedVehicle.registration}</Text>
                    </View>
                    <View
                      style={[styles.row, { alignItems: 'center', gap: 8 }]}
                    >
                      <MaterialCommunityIcons
                        name='battery'
                        size={16}
                      />
                      <Text>
                        Battery: {selectedBattery.imei} (
                        {selectedBattery.charge}, {selectedBattery.health})
                      </Text>
                    </View>
                    <View
                      style={[styles.row, { alignItems: 'center', gap: 8 }]}
                    >
                      <Feather
                        name='map-pin'
                        size={16}
                      />
                      <Text>Route: {selectedRoute.name}</Text>
                    </View>
                    <View
                      style={[styles.row, { alignItems: 'center', gap: 8 }]}
                    >
                      <Feather
                        name='shopping-bag'
                        size={16}
                      />
                      <Text>Items: {selectedFoodItems.length} food items</Text>
                    </View>
                  </View>
                </View>
              )}

            {/* Actions */}
            <View
              style={[
                styles.row,
                {
                  gap: 10,
                  marginTop: 14,
                  paddingTop: 12,
                  borderTopWidth: 1,
                  borderTopColor: '#eef1f5',
                },
              ]}
            >
              <Pressable
                onPress={createAssignment}
                disabled={!canCreate}
                style={({ pressed }) => [
                  styles.primaryBtn,
                  (!canCreate || pressed) && { opacity: 0.9 },
                  { flex: 1, justifyContent: 'center' },
                ]}
              >
                <Feather
                  name='check'
                  size={16}
                  color='#fff'
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.primaryBtnText}>Create Assignment</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setIsOpen(false);
                  resetModal();
                }}
                style={({ pressed }) => [
                  styles.ghostBtn,
                  pressed && { opacity: 0.85 },
                  { flex: 1, justifyContent: 'center' },
                ]}
              >
                <Text style={styles.ghostBtnText}>Cancel</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Picker sheets */}
      <PickerSheet
        visible={riderOpen}
        onClose={() => setRiderOpen(false)}
        title='Choose rider'
        items={availableRiders}
        renderLeft={(r: Rider) => (
          <>
            <Feather
              name='user'
              size={16}
              color='#111827'
            />
            <Text style={{ fontWeight: '600', color: '#111827' }}>
              {r.name}
            </Text>
          </>
        )}
        renderRight={(r: Rider) => (
          <Badge
            text={r.status}
            variant={r.status === 'Available' ? 'solid' : 'outline'}
            color={r.status === 'Available' ? '#059669' : '#6b7280'}
          />
        )}
        onSelect={(r) => setSelectedRider(r)}
      />
      <PickerSheet
        visible={vehicleOpen}
        onClose={() => setVehicleOpen(false)}
        title='Choose vehicle'
        items={availableVehicles}
        renderLeft={(v: Vehicle) => (
          <>
            <Feather
              name='truck'
              size={16}
              color='#111827'
            />
            <Text style={{ fontWeight: '600', color: '#111827' }}>
              {v.registration} - {v.type}
            </Text>
          </>
        )}
        renderRight={(v: Vehicle) => (
          <Badge
            text={v.status}
            variant={v.status === 'Available' ? 'solid' : 'outline'}
            color={v.status === 'Available' ? '#059669' : '#6b7280'}
          />
        )}
        onSelect={(v) => setSelectedVehicle(v)}
      />
      <PickerSheet
        visible={batteryOpen}
        onClose={() => setBatteryOpen(false)}
        title='Choose battery'
        items={availableBatteries}
        renderLeft={(b: Battery) => (
          <>
            <MaterialCommunityIcons
              name='battery'
              size={16}
              color='#111827'
            />
            <Text style={{ fontWeight: '600', color: '#111827' }}>
              {b.imei} {b.vehicle ? `• ${b.vehicle}` : ''}
            </Text>
          </>
        )}
        renderRight={(b: Battery) => (
          <View style={[styles.row, { alignItems: 'center', gap: 6 }]}>
            {(() => batteryStatusDot(b.status))()}
            <Text style={styles.subtleSmall}>
              {b.charge} • {b.health}
            </Text>
          </View>
        )}
        onSelect={(b) => setSelectedBattery(b)}
      />
      <PickerSheet
        visible={routeOpen}
        onClose={() => setRouteOpen(false)}
        title='Choose route'
        items={routes}
        renderLeft={(rt: Route) => (
          <>
            <Feather
              name='map'
              size={16}
              color='#111827'
            />
            <Text style={{ fontWeight: '600', color: '#111827' }}>
              {rt.name} - {rt.stops} stops
            </Text>
          </>
        )}
        renderRight={(rt: Route) => (
          <Badge
            text={rt.status}
            variant={rt.status === 'Available' ? 'solid' : 'outline'}
            color={rt.status === 'Available' ? '#059669' : '#6b7280'}
          />
        )}
        onSelect={(rt) => setSelectedRoute(rt)}
      />
      <PickerSheet
        visible={foodPickerOpen}
        onClose={() => setFoodPickerOpen(false)}
        title='Select food item'
        items={remainingFoodOptions}
        renderLeft={(f: FoodItem) => (
          <>
            <Feather
              name='box'
              size={16}
              color='#111827'
            />
            <Text style={{ fontWeight: '600', color: '#111827' }}>
              {f.name}
            </Text>
          </>
        )}
        renderRight={(f: FoodItem) => (
          <Text style={styles.subtleSmall}>Avail: {f.available}</Text>
        )}
        onSelect={(f) => setCurrentFoodItem(f)}
      />
    </ScrollView>
  );
}

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  page: { padding: 16, gap: 16, paddingBottom: 32, backgroundColor: '#f9fafb' },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  h1: { fontSize: 22, fontWeight: '800', color: '#111827' },
  bold: { fontWeight: '800', color: '#111827' },
  subtle: { color: '#6b7280' },
  subtleSmall: { color: '#6b7280', fontSize: 12 },

  row: { flexDirection: 'row' },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  /* Card */
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#eceff3',
    shadowColor: '#0f172a',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },

  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#111827' },

  /* input-like pressables */
  label: { fontSize: 12, fontWeight: '700', color: '#374151', marginBottom: 6 },
  inputLike: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputPlaceholder: { color: '#6b7280' },
  inputValue: { color: '#111827', fontWeight: '700' },

  /* qty input */
  qtyInput: {
    height: 44,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 10,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    backgroundColor: '#fff',
  },

  /* assignment list */
  assignmentCard: {
    borderWidth: 1,
    borderColor: '#eef1f5',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#fff',
  },
  assignmentGrid: {
    gap: 8,
    marginBottom: 8,
  },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#fff',
  },
  chipText: { color: '#111827', fontSize: 12, fontWeight: '700' },

  /* buttons */
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  primaryBtnText: { color: '#fff', fontWeight: '800' },
  ghostBtn: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  ghostBtnText: { color: '#111827', fontWeight: '800' },
  outlineBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  iconBtn: {
    padding: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
  },

  /* badge */
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },

  /* modal */
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)' },
  modalCard: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '85%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 2,
  },

  /* sheet picker */
  sheetBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '70%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 16,
  },
  sheetHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eef1f5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sheetTitle: { fontSize: 16, fontWeight: '800', color: '#111827' },
  optionRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  /* helpers */
  grid2: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  selectedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
  },

  /* tiny badge-dot */
  badgeDot: { width: 10, height: 10, borderRadius: 5 },
  actionsRow: {

    flexDirection: 'row',
    justifyContent: 'flex-start', // use "flex-start" if you want it left-aligned
  },
  gradientBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    // optional subtle shadow to match your cards:
    shadowColor: "#0f172a",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },
  gradientBtnText: {
    fontWeight: "800",
    color: "#ffffff", // dark text reads better on yellow
  },
  
  
});
