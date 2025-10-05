diff --git a//dev/null b/SERVESOFT_CODE.md
index 0000000000000000000000000000000000000000..2764a9f84e9e923038cb21ebcdffee29f5c2753c 100644
--- a//dev/null
+++ b/SERVESOFT_CODE.md
@@ -0,0 +1,4120 @@
+# Servesoft Source Snapshot
+
+## index.html
+
+```html
+<!DOCTYPE html>
+<html lang="en">
+<head>
+  <meta charset="UTF-8">
+  <meta name="viewport" content="width=device-width, initial-scale=1.0">
+  <title>Servesoft Control Center</title>
+  <link rel="stylesheet" href="styles.css">
+</head>
+<body>
+  <main id="app" aria-live="polite"></main>
+  <script type="module" src="app.js"></script>
+</body>
+</html>
+```
+
+## styles.css
+
+```css
+:root {
+  --bg: #fdf8f3;
+  --surface: #ffffff;
+  --surface-alt: #fff5eb;
+  --primary: #f97316;
+  --primary-dark: #ea580c;
+  --secondary: #16a34a;
+  --secondary-dark: #15803d;
+  --accent: #facc15;
+  --text: #1f2937;
+  --text-muted: #4b5563;
+  --border: #fcd7af;
+  --radius-lg: 18px;
+  --radius-md: 12px;
+  --shadow: 0 24px 45px rgba(249, 115, 22, 0.18);
+  font-family: "Poppins", "Segoe UI", sans-serif;
+}
+
+* {
+  box-sizing: border-box;
+}
+
+body {
+  margin: 0;
+  min-height: 100vh;
+  background: linear-gradient(160deg, rgba(249, 115, 22, 0.12), rgba(22, 163, 74, 0.12));
+  color: var(--text);
+}
+
+main {
+  width: min(1200px, 94vw);
+  margin: 3rem auto;
+}
+
+h1, h2, h3, h4 {
+  color: var(--primary-dark);
+  margin-top: 0;
+}
+
+p {
+  line-height: 1.6;
+}
+
+a {
+  color: inherit;
+  text-decoration: none;
+}
+
+a:hover {
+  text-decoration: underline;
+}
+
+button {
+  border: none;
+  border-radius: 999px;
+  padding: 0.7rem 1.5rem;
+  font-weight: 600;
+  font-size: 1rem;
+  cursor: pointer;
+  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
+}
+
+button.primary {
+  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
+  color: #fff7ed;
+  box-shadow: 0 15px 25px rgba(249, 115, 22, 0.3);
+}
+
+button.secondary {
+  background: linear-gradient(135deg, var(--secondary), var(--secondary-dark));
+  color: #f0fdf4;
+  box-shadow: 0 15px 25px rgba(22, 163, 74, 0.25);
+}
+
+button.ghost {
+  background: transparent;
+  color: var(--secondary-dark);
+  border: 1px dashed rgba(22, 163, 74, 0.4);
+  box-shadow: none;
+}
+
+button.link {
+  background: transparent;
+  color: var(--primary-dark);
+  padding: 0.4rem 0.6rem;
+  box-shadow: none;
+}
+
+button:disabled {
+  cursor: not-allowed;
+  opacity: 0.6;
+}
+
+button:not(:disabled):hover {
+  transform: translateY(-2px);
+}
+
+.card {
+  background: var(--surface);
+  border-radius: var(--radius-lg);
+  border: 1px solid rgba(249, 115, 22, 0.2);
+  box-shadow: var(--shadow);
+  padding: clamp(1.5rem, 4vw, 2.5rem);
+  margin-bottom: 1.75rem;
+}
+
+.card > header {
+  margin-bottom: 1.25rem;
+}
+
+.card header p {
+  color: var(--text-muted);
+}
+
+.grid-two {
+  display: grid;
+  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
+  gap: 1.25rem;
+}
+
+.grid-three {
+  display: grid;
+  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
+  gap: 1rem;
+}
+
+.flex {
+  display: flex;
+  gap: 1rem;
+  flex-wrap: wrap;
+}
+
+.tag {
+  display: inline-flex;
+  align-items: center;
+  justify-content: center;
+  padding: 0.3rem 0.75rem;
+  border-radius: 999px;
+  font-size: 0.85rem;
+  font-weight: 600;
+  background: rgba(249, 115, 22, 0.12);
+  color: var(--primary-dark);
+}
+
+.tag.success {
+  background: rgba(22, 163, 74, 0.12);
+  color: var(--secondary-dark);
+}
+
+.tag.warning {
+  background: rgba(250, 204, 21, 0.2);
+  color: #92400e;
+}
+
+.tag.info {
+  background: rgba(59, 130, 246, 0.2);
+  color: #1d4ed8;
+}
+
+label {
+  display: grid;
+  gap: 0.4rem;
+  font-weight: 600;
+}
+
+input,
+select,
+textarea {
+  padding: 0.65rem 0.85rem;
+  border-radius: var(--radius-md);
+  border: 1px solid rgba(249, 115, 22, 0.35);
+  background: var(--surface-alt);
+  font: inherit;
+  transition: border-color 0.2s ease, box-shadow 0.2s ease;
+}
+
+input:focus,
+select:focus,
+textarea:focus {
+  outline: none;
+  border-color: var(--secondary);
+  box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.16);
+}
+
+textarea {
+  resize: vertical;
+}
+
+form {
+  display: grid;
+  gap: 1rem;
+}
+
+.actions {
+  display: flex;
+  flex-wrap: wrap;
+  gap: 0.75rem;
+  justify-content: flex-start;
+}
+
+.navbar {
+  display: flex;
+  flex-wrap: wrap;
+  gap: 0.6rem;
+  margin-bottom: 1.5rem;
+}
+
+.navbar button {
+  padding: 0.6rem 1rem;
+  border-radius: var(--radius-md);
+  background: rgba(249, 115, 22, 0.08);
+  color: var(--primary-dark);
+  border: 1px solid transparent;
+}
+
+.navbar button.active {
+  background: rgba(22, 163, 74, 0.14);
+  border-color: rgba(22, 163, 74, 0.4);
+  color: var(--secondary-dark);
+}
+
+.table-wrapper {
+  overflow-x: auto;
+}
+
+table {
+  width: 100%;
+  border-collapse: collapse;
+  border-radius: var(--radius-md);
+  overflow: hidden;
+}
+
+table thead {
+  background: linear-gradient(135deg, rgba(249, 115, 22, 0.95), rgba(22, 163, 74, 0.9));
+  color: #fff7ed;
+}
+
+table th,
+table td {
+  padding: 0.75rem 0.95rem;
+  border-bottom: 1px solid rgba(249, 115, 22, 0.15);
+  text-align: left;
+}
+
+table tbody tr:nth-child(even) {
+  background: rgba(249, 115, 22, 0.05);
+}
+
+.alert {
+  padding: 0.85rem 1rem;
+  border-radius: var(--radius-md);
+  border: 1px solid transparent;
+  font-weight: 500;
+}
+
+.alert.error {
+  background: #fef2f2;
+  border-color: #fecaca;
+  color: #b91c1c;
+}
+
+.alert.success {
+  background: #f0fdf4;
+  border-color: #bbf7d0;
+  color: #166534;
+}
+
+.alert.info {
+  background: #eff6ff;
+  border-color: #bfdbfe;
+  color: #1d4ed8;
+}
+
+.callout {
+  background: linear-gradient(135deg, rgba(234, 88, 12, 0.12), rgba(22, 163, 74, 0.12));
+  border-left: 4px solid #f97316;
+  padding: 0.75rem 1rem;
+  border-radius: 0.75rem;
+  margin-bottom: 1.25rem;
+  color: #065f46;
+  font-weight: 500;
+}
+
+.timeline {
+  display: grid;
+  gap: 0.75rem;
+}
+
+.timeline-item {
+  background: rgba(255, 255, 255, 0.92);
+  border-radius: var(--radius-md);
+  border: 1px solid rgba(249, 115, 22, 0.25);
+  padding: 0.75rem 1rem;
+  display: grid;
+  gap: 0.3rem;
+}
+
+.timeline-item.current {
+  border-color: rgba(22, 163, 74, 0.45);
+  box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.18);
+}
+
+.badge-group {
+  display: flex;
+  gap: 0.5rem;
+  flex-wrap: wrap;
+}
+
+.auth-overlay {
+  position: fixed;
+  inset: 0;
+  background: rgba(4, 47, 39, 0.65);
+  display: flex;
+  align-items: center;
+  justify-content: center;
+  padding: 1.5rem;
+  z-index: 1000;
+  backdrop-filter: blur(2px);
+}
+
+.auth-modal {
+  position: relative;
+  width: min(420px, 100%);
+}
+
+.close-auth {
+  position: absolute;
+  top: -0.75rem;
+  right: -0.75rem;
+  border: none;
+  width: 2.25rem;
+  height: 2.25rem;
+  border-radius: 999px;
+  background: linear-gradient(135deg, #f97316, #facc15);
+  color: #0f172a;
+  font-size: 1.35rem;
+  cursor: pointer;
+  box-shadow: 0 15px 25px rgba(249, 115, 22, 0.25);
+}
+
+.close-auth:hover {
+  background: linear-gradient(135deg, #ea580c, #f97316);
+  color: #03141b;
+}
+
+.helper-text {
+  color: var(--text-muted);
+  font-size: 0.95rem;
+}
+
+.empty-state {
+  padding: 1.25rem;
+  border-radius: var(--radius-md);
+  border: 1px dashed rgba(249, 115, 22, 0.35);
+  background: rgba(249, 115, 22, 0.06);
+  color: var(--text-muted);
+  text-align: center;
+}
+
+section.split {
+  display: grid;
+  gap: 1.5rem;
+}
+
+@media (min-width: 980px) {
+  section.split.two {
+    grid-template-columns: 1.35fr 1fr;
+  }
+
+  section.split.three {
+    grid-template-columns: 1fr 1fr 1fr;
+  }
+}
+
+@media (max-width: 720px) {
+  main {
+    width: 96vw;
+    margin: 2rem auto;
+  }
+
+  button {
+    width: 100%;
+  }
+
+  .navbar {
+    justify-content: center;
+  }
+}
+```
+
+## app.js
+
+```javascript
+const STORAGE_KEY = 'servesoft-demo-state-v2';
+
+const GUEST_CUSTOMER = {
+  id: 'guest',
+  role: 'customer',
+  name: 'Guest Visitor',
+  email: '',
+  phone: '',
+  savedAddresses: []
+};
+
+const seedState = () => ({
+  screen: { role: 'customer', section: 'ordering' },
+  currentUserId: null,
+  ui: {
+    authMode: 'login',
+    authVisible: false,
+    authMessage: '',
+    customer: {
+      section: 'ordering',
+      search: '',
+      category: 'all',
+      selectedItemId: null,
+      reviewConsent: false,
+      showReview: false
+    },
+    manager: {
+      section: 'orders',
+      selectedOrderId: null,
+      orderFilters: { status: 'ALL', type: 'ALL', range: 'TODAY' },
+      selectedTableId: null,
+      selectedReservationId: null
+    },
+    driver: {
+      section: 'availability',
+      selectedDeliveryId: null
+    },
+    admin: {
+      section: 'restaurants',
+      selectedRestaurantId: 'r1',
+      userRoleFilter: 'ALL'
+    }
+  },
+  restaurants: [
+    {
+      id: 'r1',
+      name: 'Servesoft Downtown',
+      status: 'ACTIVE',
+      location: 'Central City',
+      phone: '555-1200',
+      address: '101 Market Street, Central City',
+      hours: {
+        sunday: '08:00-21:00',
+        monday: '08:00-22:00',
+        tuesday: '08:00-22:00',
+        wednesday: '08:00-22:00',
+        thursday: '08:00-23:00',
+        friday: '08:00-23:30',
+        saturday: '09:00-23:30'
+      },
+      serviceRules: {
+        deliveryZones: ['Central', 'Uptown', 'Harbor'],
+        preorderLeadMinutes: 90,
+        tableQrPrefix: 'https://servesoft.app/entry'
+      }
+    }
+  ],
+  tables: [
+    { id: 't1', restaurantId: 'r1', label: 'Table 1', capacity: 4, state: 'FREE' },
+    { id: 't2', restaurantId: 'r1', label: 'Table 2', capacity: 2, state: 'SEATED' },
+    { id: 't3', restaurantId: 'r1', label: 'Table 3', capacity: 6, state: 'CLEANING' },
+    { id: 't4', restaurantId: 'r1', label: 'Patio A', capacity: 4, state: 'HELD' }
+  ],
+  menuItems: [
+    {
+      id: 'm1',
+      restaurantId: 'r1',
+      category: 'Starters',
+      name: 'Citrus Herb Salad',
+      price: 9.5,
+      description: 'Orange segments, greens, toasted seeds, honey-lime dressing.',
+      available: true,
+      modifiers: ['Add avocado', 'Extra dressing', 'No seeds']
+    },
+    {
+      id: 'm2',
+      restaurantId: 'r1',
+      category: 'Starters',
+      name: 'Smoked Corn Chowder',
+      price: 7.25,
+      description: 'Roasted corn, sweet peppers, coconut milk, charred scallion oil.',
+      available: true,
+      modifiers: ['Add jalapeño', 'Extra bread']
+    },
+    {
+      id: 'm3',
+      restaurantId: 'r1',
+      category: 'Mains',
+      name: 'Harissa Roasted Chicken',
+      price: 18.75,
+      description: 'Half chicken, charred lemon, herb couscous, yogurt sauce.',
+      available: true,
+      modifiers: ['Add extra sauce', 'Swap side for fries']
+    },
+    {
+      id: 'm4',
+      restaurantId: 'r1',
+      category: 'Mains',
+      name: 'Garden Pesto Pasta',
+      price: 16.5,
+      description: 'Casarecce pasta, basil pesto, blistered tomatoes, parmesan.',
+      available: false,
+      modifiers: ['Add grilled chicken', 'Add mushrooms', 'Extra pesto']
+    },
+    {
+      id: 'm5',
+      restaurantId: 'r1',
+      category: 'Desserts',
+      name: 'Mango Coconut Parfait',
+      price: 8.0,
+      description: 'Tropical mango, coconut cream, macadamia granola.',
+      available: true,
+      modifiers: ['Extra granola', 'Add lime zest']
+    },
+    {
+      id: 'm6',
+      restaurantId: 'r1',
+      category: 'Drinks',
+      name: 'Ginger Lime Fizz',
+      price: 5.5,
+      description: 'House soda with ginger syrup, lime, mint.',
+      available: true,
+      modifiers: ['Less sugar', 'No ice']
+    }
+  ],
+  users: [
+    {
+      id: 'u1',
+      role: 'customer',
+      name: 'Avery Customer',
+      email: 'avery@servesoft.app',
+      password: 'demo123!',
+      phone: '555-0100',
+      savedAddresses: [
+        {
+          id: 'addr1',
+          label: 'Home',
+          recipient: 'Avery Customer',
+          phone: '555-0100',
+          line1: '45 Greenway',
+          neighborhood: 'Central',
+          notes: 'Ring bell twice'
+        }
+      ],
+      preferences: { defaultType: 'DELIVERY' }
+    },
+    {
+      id: 'u2',
+      role: 'manager',
+      name: 'Morgan Manager',
+      email: 'morgan@servesoft.app',
+      password: 'demo123!',
+      phone: '555-0200'
+    },
+    {
+      id: 'u3',
+      role: 'driver',
+      name: 'Devon Driver',
+      email: 'devon@servesoft.app',
+      password: 'demo123!',
+      phone: '555-0300'
+    },
+    {
+      id: 'u4',
+      role: 'admin',
+      name: 'Addison Admin',
+      email: 'addison@servesoft.app',
+      password: 'demo123!',
+      phone: '555-0400'
+    },
+    {
+      id: 'u5',
+      role: 'server',
+      name: 'Sam Server',
+      email: 'sam@servesoft.app',
+      password: 'demo123!',
+      phone: '555-0500'
+    }
+  ],
+  staff: [
+    { id: 'staff1', userId: 'u2', restaurantId: 'r1', role: 'Manager', status: 'ACTIVE' },
+    { id: 'staff2', userId: 'u5', restaurantId: 'r1', role: 'Server', status: 'ACTIVE' },
+    { id: 'staff3', userId: 'u3', restaurantId: 'r1', role: 'Driver', status: 'ACTIVE' }
+  ],
+  driverStatus: {
+    u3: { available: true, activeDeliveries: [] }
+  },
+  shifts: [
+    { id: 'shift1', staffId: 'staff2', restaurantId: 'r1', date: '2024-06-23', start: '10:00', end: '18:00', notes: 'Lunch floor coverage' }
+  ],
+  announcements: [
+    {
+      id: 'msg1',
+      restaurantId: 'r1',
+      scope: 'ALL',
+      title: 'Welcome to Servesoft!',
+      body: 'Remember to refresh the orders dashboard every few minutes for the latest updates.',
+      createdAt: new Date().toISOString(),
+      createdBy: 'u2'
+    }
+  ],
+  orders: [
+    {
+      id: 'order1',
+      code: 'ORD-1001',
+      restaurantId: 'r1',
+      customerId: 'u1',
+      type: 'TABLE',
+      tableId: 't2',
+      schedule: null,
+      deliveryAddress: null,
+      status: 'IN_PREP',
+      createdAt: '2024-06-22T11:15:00Z',
+      items: [
+        { menuId: 'm1', name: 'Citrus Herb Salad', quantity: 1, price: 9.5, modifiers: ['Extra dressing'], notes: '' },
+        { menuId: 'm6', name: 'Ginger Lime Fizz', quantity: 2, price: 5.5, modifiers: ['No ice'], notes: '' }
+      ],
+      subtotal: 20.5,
+      fees: 2,
+      total: 22.5,
+      timeline: [
+        { status: 'RECEIVED', note: 'Order placed via table QR.', at: '2024-06-22T11:15:00Z' },
+        { status: 'IN_PREP', note: 'Kitchen preparing dishes.', at: '2024-06-22T11:18:00Z' }
+      ]
+    },
+    {
+      id: 'order2',
+      code: 'ORD-1002',
+      restaurantId: 'r1',
+      customerId: 'u1',
+      type: 'DELIVERY',
+      tableId: null,
+      schedule: null,
+      deliveryAddress: {
+        recipient: 'Avery Customer',
+        phone: '555-0100',
+        line1: '45 Greenway',
+        neighborhood: 'Central',
+        notes: 'Ring bell twice'
+      },
+      status: 'READY',
+      createdAt: '2024-06-23T14:05:00Z',
+      items: [
+        { menuId: 'm3', name: 'Harissa Roasted Chicken', quantity: 1, price: 18.75, modifiers: ['Add extra sauce'], notes: '' }
+      ],
+      subtotal: 18.75,
+      fees: 3,
+      total: 21.75,
+      timeline: [
+        { status: 'RECEIVED', note: 'Delivery order submitted from deep link.', at: '2024-06-23T14:05:00Z' },
+        { status: 'IN_PREP', note: 'Kitchen preparing.', at: '2024-06-23T14:08:00Z' },
+        { status: 'READY', note: 'Packed and ready for dispatch.', at: '2024-06-23T14:30:00Z' }
+      ]
+    }
+  ],
+  deliveries: [
+    {
+      id: 'delivery1',
+      orderId: 'order2',
+      driverId: 'u3',
+      status: 'ASSIGNED',
+      history: [
+        { status: 'ASSIGNED', at: '2024-06-23T14:32:00Z', note: 'Assigned by Morgan Manager.' }
+      ],
+      accepted: null
+    }
+  ],
+  reservations: [
+    {
+      id: 'res1',
+      restaurantId: 'r1',
+      customerId: 'u1',
+      tableId: 't4',
+      date: '2024-06-24',
+      time: '19:00',
+      partySize: 4,
+      notes: 'Anniversary dinner',
+      status: 'CONFIRMED'
+    }
+  ],
+  cartDrafts: {},
+  entryContext: {},
+  feedback: [],
+  logs: [
+    { id: 'log1', type: 'ORDER_STATUS', message: 'Order ORD-1001 advanced to IN_PREP by Morgan Manager.', createdAt: '2024-06-22T11:18:00Z', actorId: 'u2' },
+    { id: 'log2', type: 'DELIVERY_ASSIGN', message: 'Order ORD-1002 assigned to Devon Driver.', createdAt: '2024-06-23T14:32:00Z', actorId: 'u2' }
+  ]
+});
+
+function loadState() {
+  try {
+    const raw = localStorage.getItem(STORAGE_KEY);
+    const base = seedState();
+    if (!raw) return base;
+    const parsed = JSON.parse(raw);
+    const merged = { ...base, ...parsed };
+    const hasCurrent = merged.currentUserId && merged.users.some((user) => user.id === merged.currentUserId);
+    if (!hasCurrent) {
+      const fallbackCustomer = merged.users.find((user) => user.role === 'customer');
+      merged.currentUserId = fallbackCustomer ? fallbackCustomer.id : base.currentUserId;
+    }
+    merged.screen = { role: 'customer', section: 'ordering' };
+    merged.ui.customer.section = 'ordering';
+    return merged;
+  } catch (error) {
+    console.warn('Failed to load saved state, using seed state.', error);
+    return seedState();
+  }
+}
+
+function persistState(state) {
+  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
+}
+
+function clone(value) {
+  return JSON.parse(JSON.stringify(value));
+}
+
+const store = {
+  state: loadState(),
+  listeners: [],
+  subscribe(listener) {
+    this.listeners.push(listener);
+    listener(this.state);
+  },
+  setState(updater) {
+    const draft = clone(this.state);
+    const next = typeof updater === 'function' ? updater(draft) : { ...draft, ...updater };
+    this.state = next;
+    persistState(this.state);
+    this.listeners.forEach((listener) => listener(this.state));
+  }
+};
+
+function showAuthPrompt(message = '', mode) {
+  store.setState((state) => {
+    state.ui.authVisible = true;
+    state.ui.authMessage = message;
+    if (mode) {
+      state.ui.authMode = mode;
+    } else if (!state.ui.authMode) {
+      state.ui.authMode = 'login';
+    }
+    return state;
+  });
+}
+
+function hideAuthPrompt() {
+  store.setState((state) => {
+    state.ui.authVisible = false;
+    state.ui.authMessage = '';
+    return state;
+  });
+}
+
+async function hydrateFromServer() {
+  try {
+    const response = await fetch('bootstrap.php', { headers: { Accept: 'application/json' } });
+    if (!response.ok) throw new Error(`Request failed: ${response.status}`);
+    const payload = await response.json();
+    store.setState((state) => {
+      const defaultHours = state.restaurants[0]?.hours || {
+        sunday: '08:00-21:00',
+        monday: '08:00-22:00',
+        tuesday: '08:00-22:00',
+        wednesday: '08:00-22:00',
+        thursday: '08:00-23:00',
+        friday: '08:00-23:30',
+        saturday: '09:00-23:30'
+      };
+      const defaultRules = state.restaurants[0]?.serviceRules || {
+        deliveryZones: [],
+        preorderLeadMinutes: 90,
+        tableQrPrefix: ''
+      };
+
+      if (Array.isArray(payload.restaurants) && payload.restaurants.length) {
+        state.restaurants = payload.restaurants.map((restaurant) => ({
+          id: restaurant.id,
+          name: restaurant.name,
+          status: restaurant.status || 'ACTIVE',
+          location: restaurant.location || '',
+          phone: restaurant.phone || '',
+          address: restaurant.address || '',
+          hours: restaurant.hours || defaultHours,
+          serviceRules: restaurant.serviceRules || defaultRules
+        }));
+      }
+
+      if (Array.isArray(payload.tables)) {
+        state.tables = payload.tables.map((table) => ({
+          id: table.id,
+          restaurantId: table.restaurantId,
+          label: table.label,
+          capacity: table.capacity,
+          state: table.state || 'FREE'
+        }));
+      }
+
+      if (Array.isArray(payload.menuItems)) {
+        state.menuItems = payload.menuItems.map((item) => ({
+          id: item.id,
+          restaurantId: item.restaurantId,
+          category: item.category || 'General',
+          name: item.name,
+          price: Number(item.price || 0),
+          description: item.description || '',
+          available: Boolean(item.available),
+          modifiers: Array.isArray(item.modifiers) ? item.modifiers : []
+        }));
+      }
+
+      const availableRestaurantIds = state.restaurants.map((restaurant) => restaurant.id);
+      Object.values(state.cartDrafts).forEach((cart) => {
+        if (!availableRestaurantIds.includes(cart.restaurantId)) {
+          cart.restaurantId = state.restaurants[0]?.id || cart.restaurantId;
+        }
+      });
+
+      if (!availableRestaurantIds.includes(state.ui.admin.selectedRestaurantId)) {
+        state.ui.admin.selectedRestaurantId = state.restaurants[0]?.id || null;
+      }
+
+      return state;
+    });
+  } catch (error) {
+    console.warn('Unable to hydrate state from database. Falling back to demo seed.', error);
+  }
+}
+
+hydrateFromServer();
+
+const formatCurrency = (value) => `$${value.toFixed(2)}`;
+const formatDate = (iso) => {
+  if (!iso) return '';
+  const date = new Date(iso);
+  return date.toLocaleString();
+};
+
+const statusLabels = {
+  RECEIVED: 'Received',
+  IN_PREP: 'In Prep',
+  READY: 'Ready',
+  PICKED_UP: 'Picked up',
+  OUT_FOR_DELIVERY: 'Out for delivery',
+  COMPLETED: 'Completed',
+  DELIVERED: 'Delivered',
+  CANCELLED: 'Cancelled',
+  FAILED: 'Failed'
+};
+
+function getCurrentUser(state) {
+  if (!state.currentUserId) return null;
+  return state.users.find((user) => user.id === state.currentUserId) || null;
+}
+
+function isGuestUser(user) {
+  return !user || user.id === GUEST_CUSTOMER.id;
+}
+
+function getActingCustomer(state) {
+  return getCurrentUser(state) || GUEST_CUSTOMER;
+}
+
+function deriveRestaurantForUser(state, user) {
+  if (!user) return null;
+  if (user.role === 'manager' || user.role === 'server' || user.role === 'driver') {
+    const staffRecord = state.staff.find((staff) => staff.userId === user.id);
+    if (!staffRecord) return null;
+    return state.restaurants.find((restaurant) => restaurant.id === staffRecord.restaurantId) || null;
+  }
+  return state.restaurants[0];
+}
+
+function ensureCart(state, userId) {
+  if (!state.cartDrafts[userId]) {
+    const user = state.users.find((candidate) => candidate.id === userId) || null;
+    const restaurant = deriveRestaurantForUser(state, user) || state.restaurants[0] || { id: 'r1' };
+    state.cartDrafts[userId] = {
+      restaurantId: restaurant.id,
+      orderType: null,
+      tableId: null,
+      schedule: { date: '', time: '' },
+      delivery: { recipient: '', phone: '', line1: '', neighborhood: '', notes: '' },
+      items: [],
+      fees: 0,
+      notes: ''
+    };
+  }
+  return state.cartDrafts[userId];
+}
+
+function calculateCartTotals(items) {
+  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
+  const fees = subtotal > 0 ? Math.max(1, subtotal * 0.08) : 0;
+  return { subtotal, fees, total: subtotal + fees };
+}
+
+function createOrderFromCart(state, user, cart) {
+  const { subtotal, fees, total } = calculateCartTotals(cart.items);
+  const orderId = `order${Date.now()}`;
+  const code = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
+  const order = {
+    id: orderId,
+    code,
+    restaurantId: cart.restaurantId,
+    customerId: user.id,
+    type: cart.orderType,
+    tableId: cart.tableId,
+    schedule: cart.schedule.date && cart.schedule.time ? { ...cart.schedule } : null,
+    deliveryAddress: cart.orderType === 'DELIVERY' ? { ...cart.delivery } : null,
+    status: 'RECEIVED',
+    createdAt: new Date().toISOString(),
+    items: cart.items.map((item) => ({
+      menuId: item.menuId,
+      name: item.name,
+      quantity: item.quantity,
+      price: item.price,
+      modifiers: item.modifiers,
+      notes: item.notes
+    })),
+    subtotal,
+    fees,
+    total,
+    timeline: [
+      { status: 'RECEIVED', note: 'Order submitted by customer.', at: new Date().toISOString() }
+    ]
+  };
+  return order;
+}
+
+function getOrderTimeline(order) {
+  const progression = ['RECEIVED', 'IN_PREP', 'READY', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'COMPLETED', 'DELIVERED', 'CANCELLED', 'FAILED'];
+  const uniqueTimeline = [];
+  progression.forEach((status) => {
+    const entry = order.timeline.find((item) => item.status === status);
+    if (entry) uniqueTimeline.push(entry);
+  });
+  return uniqueTimeline;
+}
+
+function renderApp(state) {
+  const user = getCurrentUser(state);
+  let content = '';
+
+  if (!user) {
+    content = renderCustomer(state, GUEST_CUSTOMER);
+  } else {
+    switch (user.role) {
+      case 'customer':
+        content = renderCustomer(state, user);
+        break;
+      case 'manager':
+      case 'server':
+        content = renderManager(state, user);
+        break;
+      case 'driver':
+        content = renderDriver(state, user);
+        break;
+      case 'admin':
+        content = renderAdmin(state, user);
+        break;
+      default:
+        content = renderUnknownRole(state, user);
+    }
+  }
+
+  if (state.ui.authVisible) {
+    content += renderAuthOverlay(state);
+  }
+
+  return content;
+}
+
+function renderAuth(state) {
+  const { authMode, authMessage } = state.ui;
+  const message = authMode === 'register'
+    ? 'Create a Servesoft account to browse menus, manage reservations, and place dine-in, pre-order, or delivery requests.'
+    : 'Sign in with your Servesoft credentials. Restaurant managers register their staff directly in the Staff view.';
+  const actionLabel = authMode === 'register' ? 'Already registered? Sign in' : 'Need an account? Register';
+  const actionMode = authMode === 'register' ? 'login' : 'register';
+  const addresses = (state.users.find((user) => user.role === 'customer')?.savedAddresses || [])
+    .map((address) => `<span class="tag">${address.label}</span>`)
+    .join(' ');
+
+  return `
+    <section class="card">
+      <header>
+        <h1>Servesoft Access</h1>
+        <p>${message}</p>
+      </header>
+      ${authMessage ? `<div class="callout">${authMessage}</div>` : ''}
+      <form data-form="${authMode === 'register' ? 'signup' : 'login'}">
+        ${authMode === 'register'
+          ? `
+            <label>
+              Full name
+              <input name="name" placeholder="Your full name" required />
+            </label>
+            <label>
+              Phone number
+              <input name="phone" placeholder="Contact phone" />
+            </label>`
+          : ''}
+        <label>
+          Email
+          <input name="email" type="email" placeholder="you@servesoft.app" required />
+        </label>
+        <label>
+          Password
+          <input name="password" type="password" placeholder="At least 8 characters" required />
+        </label>
+        ${authMode === 'register'
+          ? `
+            <label>
+              Confirm password
+              <input name="confirm" type="password" placeholder="Repeat password" required />
+            </label>`
+          : ''}
+        <div class="actions">
+          <button class="primary" type="submit">${authMode === 'register' ? 'Create account' : 'Sign in'}</button>
+          <button class="link" type="button" data-action="toggle-auth" data-mode="${actionMode}">${actionLabel}</button>
+        </div>
+      </form>
+      <footer class="helper-text">
+        Sample customer saved addresses: ${addresses || 'none yet'}
+      </footer>
+    </section>
+  `;
+}
+
+function renderAuthOverlay(state) {
+  return `
+    <div class="auth-overlay" role="dialog" aria-modal="true">
+      <div class="auth-modal">
+        <button class="close-auth" data-action="close-auth" aria-label="Close sign in">×</button>
+        ${renderAuth(state)}
+      </div>
+    </div>
+  `;
+}
+
+function renderHeader(title, subtitle, user) {
+  const guest = isGuestUser(user);
+  return `
+    <section class="card">
+      <header>
+        <h1>${title}</h1>
+        <p>${subtitle}</p>
+      </header>
+      <div class="actions">
+        <span class="tag info">${guest ? 'Browsing as guest' : `Logged in as ${user.name} · ${user.role.toUpperCase()}`}</span>
+        ${guest
+          ? '<button class="primary" data-action="show-auth" data-message="Sign in or create an account to keep your cart and place orders." data-mode="login">Sign in / Sign up</button>'
+          : '<button class="ghost" data-action="logout">Logout</button>'}
+      </div>
+    </section>
+  `;
+}
+
+function renderCustomer(state, user) {
+  const guest = isGuestUser(user);
+  const headerTitle = guest ? 'Servesoft Guest Experience' : 'Servesoft Ordering Hub';
+  const headerSubtitle = guest
+    ? 'Browse the menu and customise items. Sign in when you are ready to save your cart and place orders.'
+    : 'Browse menus, manage reservations, and track orders all in one place.';
+  const nav = renderNavigation('customer', state.ui.customer.section, [
+    { id: 'ordering', label: 'Entry & Ordering' },
+    { id: 'reservations', label: 'Reservations' },
+    { id: 'orders', label: 'Orders & Status' },
+    { id: 'profile', label: 'Profile' },
+    { id: 'help', label: 'Help' }
+  ]);
+
+  let body = '';
+  switch (state.ui.customer.section) {
+    case 'ordering':
+      body = renderCustomerOrdering(state, user);
+      break;
+    case 'reservations':
+      body = renderCustomerReservations(state, user);
+      break;
+    case 'orders':
+      body = renderCustomerOrders(state, user);
+      break;
+    case 'profile':
+      body = renderCustomerProfile(state, user);
+      break;
+    case 'help':
+      body = renderHelpCenter(state, user);
+      break;
+    default:
+      body = '<section class="card"><p>Section coming soon.</p></section>';
+  }
+
+  return `
+    ${renderHeader(headerTitle, headerSubtitle, user)}
+    ${nav}
+    ${body}
+  `;
+}
+
+function renderAuthRequiredCard(title, message) {
+  return `
+    <section class="card">
+      <header>
+        <h2>${title}</h2>
+        <p>${message}</p>
+      </header>
+      <div class="actions">
+        <button class="primary" data-action="show-auth">Sign in / Sign up</button>
+      </div>
+    </section>
+  `;
+}
+
+function renderNavigation(role, active, items) {
+  const buttons = items.map((item) => `
+    <button data-action="switch-section" data-role="${role}" data-section="${item.id}" class="${item.id === active ? 'active' : ''}">
+      ${item.label}
+    </button>
+  `).join('');
+
+  return `<nav class="navbar">${buttons}</nav>`;
+}
+
+function renderCustomerOrdering(state, user) {
+  const cart = ensureCart(state, user.id);
+  const restaurant = state.restaurants.find((rest) => rest.id === cart.restaurantId);
+  const menuItems = state.menuItems.filter((item) => item.restaurantId === cart.restaurantId);
+  const categories = ['all', ...new Set(menuItems.map((item) => item.category))];
+  const { search, category, selectedItemId } = state.ui.customer;
+  const filteredItems = menuItems.filter((item) => {
+    const matchesSearch = search ? item.name.toLowerCase().includes(search.toLowerCase()) : true;
+    const matchesCategory = category === 'all' ? true : item.category === category;
+    return matchesSearch && matchesCategory;
+  });
+  const selectedItem = selectedItemId ? menuItems.find((item) => item.id === selectedItemId) : null;
+  const totals = calculateCartTotals(cart.items);
+
+  return `
+    <section class="card">
+      <header>
+        <h2>Entry Router</h2>
+        <p>Scan a QR code or follow a deep link to start your order. Context determines required information.</p>
+      </header>
+      <form data-form="entry-context">
+        <div class="grid-two">
+          <label>
+            Restaurant
+            <select name="restaurantId">
+              ${state.restaurants.map((rest) => `<option value="${rest.id}" ${rest.id === cart.restaurantId ? 'selected' : ''}>${rest.name}</option>`).join('')}
+            </select>
+          </label>
+          <label>
+            Intent
+            <select name="intent">
+              <option value="TABLE" ${cart.orderType === 'TABLE' ? 'selected' : ''}>Table (QR)</option>
+              <option value="PREORDER" ${cart.orderType === 'PREORDER' ? 'selected' : ''}>Pre-order</option>
+              <option value="DELIVERY" ${cart.orderType === 'DELIVERY' ? 'selected' : ''}>Delivery</option>
+            </select>
+          </label>
+        </div>
+        <div class="grid-two">
+          <label>
+            Table ID (for dine-in)
+            <select name="tableId">
+              <option value="">-- optional --</option>
+              ${state.tables.filter((table) => table.restaurantId === cart.restaurantId).map((table) => `<option value="${table.id}" ${table.id === cart.tableId ? 'selected' : ''}>${table.label}</option>`).join('')}
+            </select>
+          </label>
+          <label>
+            Pre-order date
+            <input type="date" name="date" value="${cart.schedule.date}" />
+          </label>
+        </div>
+        <div class="grid-two">
+          <label>
+            Pre-order time
+            <input type="time" name="time" value="${cart.schedule.time}" />
+          </label>
+          <label>
+            Delivery neighborhood (Delivery only)
+            <select name="neighborhood">
+              <option value="">-- choose zone --</option>
+              ${restaurant.serviceRules.deliveryZones.map((zone) => `<option value="${zone}" ${cart.delivery.neighborhood === zone ? 'selected' : ''}>${zone}</option>`).join('')}
+            </select>
+          </label>
+        </div>
+        <div class="grid-two">
+          <label>
+            Delivery address
+            <input name="line1" value="${cart.delivery.line1}" placeholder="Street and number" />
+          </label>
+          <label>
+            Delivery notes
+            <input name="notes" value="${cart.delivery.notes}" placeholder="Access notes" />
+          </label>
+        </div>
+        <div class="grid-two">
+          <label>
+            Delivery recipient
+            <input name="recipient" value="${cart.delivery.recipient}" placeholder="Who receives the order" />
+          </label>
+          <label>
+            Recipient phone
+            <input name="phone" value="${cart.delivery.phone}" placeholder="Contact number" />
+          </label>
+        </div>
+        <div class="actions">
+          <button class="secondary" type="submit">Apply entry context</button>
+          <span class="helper-text">QR codes preselect table; deep links set intent and restaurant automatically.</span>
+        </div>
+      </form>
+    </section>
+    <section class="card">
+      <header>
+        <h2>Browse Menu</h2>
+        <p>Find dishes, check availability, and open details to customize items before adding to cart.</p>
+      </header>
+      <div class="grid-two">
+        <label>
+          Search
+          <input data-field="customer-search" placeholder="Search menu" value="${search}" />
+        </label>
+        <label>
+          Category
+          <select data-field="customer-category">
+            ${categories.map((cat) => `<option value="${cat}" ${category === cat ? 'selected' : ''}>${cat === 'all' ? 'All categories' : cat}</option>`).join('')}
+          </select>
+        </label>
+      </div>
+      <div class="grid-two" role="list">
+        ${filteredItems.map((item) => `
+          <article role="listitem" class="card" style="box-shadow:none;border:1px solid rgba(22,163,74,0.15);margin:0">
+            <header>
+              <h3>${item.name}</h3>
+              <p>${item.description}</p>
+            </header>
+            <div class="badge-group">
+              <span class="tag">${item.category}</span>
+              <span class="tag ${item.available ? 'success' : 'warning'}">${item.available ? 'Available' : 'Temporarily unavailable'}</span>
+              <span class="tag info">${formatCurrency(item.price)}</span>
+            </div>
+            <div class="actions" style="margin-top:1rem">
+              <button class="primary" data-action="open-item" data-item="${item.id}" ${item.available ? '' : 'disabled'}>View & customize</button>
+              <button class="ghost" data-action="quick-add" data-item="${item.id}" ${item.available ? '' : 'disabled'}>Quick add</button>
+            </div>
+          </article>
+        `).join('') || '<div class="empty-state">No items found for this search.</div>'}
+      </div>
+    </section>
+    ${selectedItem ? renderItemCustomization(selectedItem, cart) : ''}
+    <section class="card">
+      <header>
+        <h2>Cart</h2>
+        <p>Review selections, adjust quantities, and capture fees. No online payment is collected.</p>
+      </header>
+      ${cart.items.length === 0
+        ? '<div class="empty-state">Cart is empty. Add menu items to begin.</div>'
+        : `
+          <div class="timeline">
+            ${cart.items.map((item, index) => `
+              <div class="timeline-item">
+                <strong>${item.name}</strong>
+                <span>${item.quantity} × ${formatCurrency(item.price)}</span>
+                <span class="helper-text">${item.modifiers.length ? item.modifiers.join(', ') : 'No modifiers'}${item.notes ? ` · Notes: ${item.notes}` : ''}</span>
+                <div class="actions">
+                  <button class="ghost" data-action="edit-cart-item" data-index="${index}">Edit</button>
+                  <button class="link" data-action="remove-cart-item" data-index="${index}">Remove</button>
+                </div>
+              </div>
+            `).join('')}
+          </div>
+        `}
+      <section class="grid-two" style="margin-top:1.25rem">
+        <div>
+          <h3>Order type requirements</h3>
+          <p class="helper-text">
+            ${cart.orderType === 'TABLE' ? 'Table bound via QR — no additional details needed.'
+              : cart.orderType === 'PREORDER' ? 'Provide the desired visit date and time; Servesoft validates lead time.'
+              : cart.orderType === 'DELIVERY' ? 'Enter delivery address and ensure the neighborhood is within a service zone.'
+              : 'Choose an order type to continue.'}
+          </p>
+          <button class="ghost" data-action="force-order-type">Choose order type</button>
+        </div>
+        <div>
+          <h3>Totals</h3>
+          <p>Subtotal: <strong>${formatCurrency(totals.subtotal)}</strong></p>
+          <p>Service & packaging: <strong>${formatCurrency(totals.fees)}</strong></p>
+          <p>Total due on arrival/delivery: <strong>${formatCurrency(totals.total)}</strong></p>
+        </div>
+      </section>
+      <div class="actions">
+        <button class="primary" data-action="review-order" ${cart.items.length === 0 ? 'disabled' : ''}>Review & submit</button>
+        <span class="helper-text">Payments are settled outside Servesoft. You will receive status updates in the timeline.</span>
+      </div>
+    </section>
+    ${state.ui.customer.showReview ? renderReviewSubmit(cart, totals, state, user) : ''}
+  `;
+}
+function renderItemCustomization(item, cart) {
+  const existing = cart.items.find((entry) => entry.menuId === item.id);
+  const quantity = existing ? existing.quantity : 1;
+  const notes = existing ? existing.notes : '';
+  const selectedModifiers = new Set(existing ? existing.modifiers : []);
+  return `
+    <section class="card">
+      <header>
+        <h2>Customize ${item.name}</h2>
+        <p>Select modifiers, adjust quantity, and add notes.</p>
+      </header>
+      <form data-form="customize-item" data-item="${item.id}">
+        <div class="grid-two">
+          <label>
+            Quantity
+            <input type="number" name="quantity" min="1" value="${quantity}" required />
+          </label>
+          <label>
+            Special notes
+            <input name="notes" value="${notes}" placeholder="Extra instructions" />
+          </label>
+        </div>
+        <fieldset style="border:none;padding:0">
+          <legend style="font-weight:600;margin-bottom:0.75rem">Modifiers</legend>
+          <div class="grid-two">
+            ${item.modifiers.map((modifier) => `
+              <label style="font-weight:500">
+                <input type="checkbox" name="modifiers" value="${modifier}" ${selectedModifiers.has(modifier) ? 'checked' : ''} />
+                ${modifier}
+              </label>
+            `).join('')}
+          </div>
+        </fieldset>
+        <div class="actions">
+          <button class="primary" type="submit">${existing ? 'Update cart item' : 'Add to cart'}</button>
+          <button class="ghost" type="button" data-action="close-item">Cancel</button>
+        </div>
+      </form>
+    </section>
+  `;
+}
+
+function renderReviewSubmit(cart, totals, state, user) {
+  return `
+    <section class="card">
+      <header>
+        <h2>Review & Submit</h2>
+        <p>Confirm details before sending your order to the restaurant team.</p>
+      </header>
+      <div class="grid-two">
+        <div>
+          <h3>Order overview</h3>
+          <p><strong>Type:</strong> ${cart.orderType || 'Not selected'}</p>
+          ${cart.tableId ? `<p><strong>Table:</strong> ${state.tables.find((table) => table.id === cart.tableId)?.label || cart.tableId}</p>` : ''}
+          ${cart.schedule.date ? `<p><strong>Pre-order slot:</strong> ${cart.schedule.date} ${cart.schedule.time}</p>` : ''}
+          ${cart.orderType === 'DELIVERY' ? `
+            <p><strong>Deliver to:</strong> ${cart.delivery.recipient}, ${cart.delivery.line1}</p>
+            <p><strong>Neighborhood:</strong> ${cart.delivery.neighborhood || 'N/A'}</p>
+            <p><strong>Phone:</strong> ${cart.delivery.phone || 'N/A'}</p>
+          ` : ''}
+          <p><strong>Items:</strong></p>
+          <ul>
+            ${cart.items.map((item) => `<li>${item.quantity} × ${item.name} · ${item.modifiers.join(', ') || 'No modifiers'}</li>`).join('')}
+          </ul>
+        </div>
+        <div>
+          <h3>Totals</h3>
+          <p>Subtotal: ${formatCurrency(totals.subtotal)}</p>
+          <p>Service & packaging: ${formatCurrency(totals.fees)}</p>
+          <p><strong>Total due:</strong> ${formatCurrency(totals.total)}</p>
+          <label style="margin-top:1rem;display:flex;gap:0.5rem;align-items:center;font-weight:500">
+            <input type="checkbox" data-field="consent" ${state.ui.customer.reviewConsent ? 'checked' : ''} />
+            I confirm the order details and agree to pay on delivery or in-venue.
+          </label>
+        </div>
+      </div>
+      <div class="actions">
+        <button class="secondary" data-action="submit-order" ${state.ui.customer.reviewConsent ? '' : 'disabled'}>Submit order</button>
+        <button class="ghost" data-action="cancel-review">Cancel</button>
+      </div>
+    </section>
+  `;
+}
+
+function renderCustomerReservations(state, user) {
+  if (isGuestUser(user)) {
+    return renderAuthRequiredCard('Sign in to manage reservations', 'Create an account or sign in to request, view, or cancel reservations.');
+  }
+  const reservations = state.reservations.filter((reservation) => reservation.customerId === user.id);
+  return `
+    <section class="card">
+      <header>
+        <h2>Make a reservation</h2>
+        <p>Pick a date, time, and party size. Servesoft validates against the restaurant schedule.</p>
+      </header>
+      <form data-form="create-reservation">
+        <div class="grid-two">
+          <label>
+            Date
+            <input type="date" name="date" required />
+          </label>
+          <label>
+            Time
+            <input type="time" name="time" required />
+          </label>
+        </div>
+        <div class="grid-two">
+          <label>
+            Party size
+            <input type="number" name="partySize" min="1" max="12" required />
+          </label>
+          <label>
+            Notes
+            <input name="notes" placeholder="Occasion, dietary needs" />
+          </label>
+        </div>
+        <div class="actions">
+          <button class="primary" type="submit">Save reservation request</button>
+        </div>
+      </form>
+    </section>
+    <section class="card">
+      <header>
+        <h2>My reservations</h2>
+        <p>View upcoming bookings, cancel when needed, or check status before arriving.</p>
+      </header>
+      ${reservations.length === 0
+        ? '<div class="empty-state">No reservations yet. Submit a request above.</div>'
+        : `
+          <div class="timeline">
+            ${reservations.map((reservation) => {
+              const table = reservation.tableId ? state.tables.find((table) => table.id === reservation.tableId)?.label : 'To be assigned';
+              return `
+                <div class="timeline-item">
+                  <strong>${reservation.date} ${reservation.time}</strong>
+                  <span>Party of ${reservation.partySize} · ${reservation.status}</span>
+                  <span class="helper-text">Table: ${table} · Notes: ${reservation.notes || 'None'}</span>
+                  <div class="actions">
+                    <button class="ghost" data-action="cancel-reservation" data-id="${reservation.id}" ${reservation.status === 'CANCELLED' ? 'disabled' : ''}>Cancel</button>
+                  </div>
+                </div>
+              `;
+            }).join('')}
+          </div>
+        `}
+    </section>
+  `;
+}
+
+function renderCustomerOrders(state, user) {
+  if (isGuestUser(user)) {
+    return renderAuthRequiredCard('Sign in to follow orders', 'Log in to track your order timeline, request updates, or reorder past meals.');
+  }
+  const orders = state.orders.filter((order) => order.customerId === user.id);
+  return `
+    <section class="card">
+      <header>
+        <h2>Order status timeline</h2>
+        <p>Refresh manually to see updates made by the restaurant team.</p>
+      </header>
+      ${orders.length === 0 ? '<div class="empty-state">No orders yet. Place an order to track progress here.</div>'
+        : orders.map((order) => `
+            <article class="card" style="box-shadow:none;border:1px solid rgba(22,163,74,0.15);margin-bottom:1rem">
+              <header>
+                <h3>${order.code} · ${order.type}</h3>
+                <p>Placed ${formatDate(order.createdAt)} · Total ${formatCurrency(order.total)}</p>
+              </header>
+              <div class="timeline">
+                ${getOrderTimeline(order).map((item) => `
+                  <div class="timeline-item ${item.status === order.status ? 'current' : ''}">
+                    <strong>${statusLabels[item.status] || item.status}</strong>
+                    <span>${item.note}</span>
+                    <span class="helper-text">${formatDate(item.at)}</span>
+                  </div>
+                `).join('')}
+              </div>
+              <div class="actions" style="margin-top:1rem">
+                <button class="ghost" data-action="reorder" data-id="${order.id}">Reorder</button>
+              </div>
+            </article>
+        `).join('')}
+    </section>
+  `;
+}
+
+function renderCustomerProfile(state, user) {
+  if (isGuestUser(user)) {
+    return renderAuthRequiredCard('Sign in to manage your profile', 'Sign in to update contact details and save delivery addresses for faster checkout.');
+  }
+  const addresses = user.savedAddresses || [];
+  return `
+    <section class="card">
+      <header>
+        <h2>Profile</h2>
+        <p>Manage contact information and saved delivery addresses.</p>
+      </header>
+      <form data-form="update-profile">
+        <label>
+          Full name
+          <input name="name" value="${user.name}" required />
+        </label>
+        <label>
+          Phone number
+          <input name="phone" value="${user.phone || ''}" />
+        </label>
+        <div class="actions">
+          <button class="primary" type="submit">Save profile</button>
+        </div>
+      </form>
+    </section>
+    <section class="card">
+      <header>
+        <h2>Saved addresses</h2>
+        <p>Reuse addresses for faster delivery checkout. No maps required.</p>
+      </header>
+      <form data-form="add-address">
+        <div class="grid-two">
+          <label>
+            Label
+            <input name="label" placeholder="Home" required />
+          </label>
+          <label>
+            Recipient
+            <input name="recipient" placeholder="Recipient name" required />
+          </label>
+        </div>
+        <div class="grid-two">
+          <label>
+            Phone
+            <input name="phone" placeholder="Contact" required />
+          </label>
+          <label>
+            Neighborhood / Zone
+            <input name="neighborhood" placeholder="Service zone" required />
+          </label>
+        </div>
+        <label>
+          Address line
+          <input name="line1" placeholder="Street and number" required />
+        </label>
+        <label>
+          Notes
+          <input name="notes" placeholder="Entry code, etc." />
+        </label>
+        <div class="actions">
+          <button class="secondary" type="submit">Save address</button>
+        </div>
+      </form>
+      <div class="timeline" style="margin-top:1.5rem">
+        ${addresses.length === 0 ? '<div class="empty-state">No addresses saved yet.</div>'
+          : addresses.map((address) => `
+            <div class="timeline-item">
+              <strong>${address.label}</strong>
+              <span>${address.recipient} · ${address.phone}</span>
+              <span class="helper-text">${address.line1} · ${address.neighborhood}</span>
+              <div class="actions">
+                <button class="link" data-action="delete-address" data-id="${address.id}">Remove</button>
+              </div>
+            </div>
+          `).join('')}
+      </div>
+    </section>
+  `;
+}
+
+function renderHelpCenter(state, user) {
+  const faqs = [
+    {
+      q: 'How do I change my order after submitting?',
+      a: 'Contact the restaurant directly using the phone number on the receipt. Status updates are manual and appear when you refresh the timeline.'
+    },
+    {
+      q: 'Why do I need to provide a delivery neighborhood?',
+      a: 'Servesoft validates delivery requests against the restaurant’s service text zones. No map integrations are required.'
+    },
+    {
+      q: 'How do I reset my password?',
+      a: 'Contact the restaurant manager or platform admin. They can update your account from the Users & Roles area.'
+    }
+  ];
+
+  return `
+    <section class="card">
+      <header>
+        <h2>Help & Feedback</h2>
+        <p>Browse frequently asked questions and send quick feedback to the team.</p>
+      </header>
+      <div class="timeline">
+        ${faqs.map((faq) => `
+          <div class="timeline-item">
+            <strong>${faq.q}</strong>
+            <span class="helper-text">${faq.a}</span>
+          </div>
+        `).join('')}
+      </div>
+      <form data-form="send-feedback" style="margin-top:1.25rem">
+        <label>
+          Your feedback
+          <textarea name="message" rows="3" placeholder="Share an idea or report an issue." required></textarea>
+        </label>
+        <div class="actions">
+          <button class="secondary" type="submit">Send feedback</button>
+        </div>
+      </form>
+    </section>
+  `;
+}
+
+function renderManager(state, user) {
+  const allNavItems = [
+    { id: 'orders', label: 'Orders dashboard' },
+    { id: 'deliveries', label: 'Assign delivery' },
+    { id: 'tables', label: 'Floor plan' },
+    { id: 'reservations', label: 'Reservations' },
+    { id: 'menu', label: 'Menu management' },
+    { id: 'staff', label: 'Staff & shifts' },
+    { id: 'announcements', label: 'Announcements' },
+    { id: 'settings', label: 'Settings & reports' }
+  ];
+  const filteredNav = user.role === 'manager'
+    ? allNavItems
+    : allNavItems.filter((item) => item.id !== 'menu');
+  const activeSection = user.role === 'manager'
+    ? state.ui.manager.section
+    : (state.ui.manager.section === 'menu' ? 'orders' : state.ui.manager.section);
+  const nav = renderNavigation('manager', activeSection, filteredNav);
+
+  let body = '';
+  switch (activeSection) {
+    case 'orders':
+      body = renderOrdersDashboard(state, user);
+      break;
+    case 'deliveries':
+      body = renderDeliveryAssignment(state, user);
+      break;
+    case 'tables':
+      body = renderFloorPlan(state, user);
+      break;
+    case 'reservations':
+      body = renderReservationsBoard(state, user);
+      break;
+    case 'menu':
+      body = renderMenuManagement(state, user);
+      break;
+    case 'staff':
+      body = renderStaffManagement(state, user);
+      break;
+    case 'announcements':
+      body = renderAnnouncements(state, user);
+      break;
+    case 'settings':
+      body = renderSettingsReports(state, user);
+      break;
+    default:
+      body = '<section class="card"><p>Section coming soon.</p></section>';
+  }
+
+  return `
+    ${renderHeader('Restaurant Manager Console', 'Run daily operations from one dashboard. Managers can register staff from the Staff view.', user)}
+    ${nav}
+    ${body}
+  `;
+}
+
+function getManagerRestaurant(state, user) {
+  const staffRecord = state.staff.find((staff) => staff.userId === user.id);
+  if (!staffRecord) return null;
+  return state.restaurants.find((rest) => rest.id === staffRecord.restaurantId) || null;
+}
+
+function renderOrdersDashboard(state, user) {
+  const restaurant = getManagerRestaurant(state, user);
+  if (!restaurant) {
+    return '<section class="card"><p>No restaurant assigned. Contact an admin.</p></section>';
+  }
+  const filters = state.ui.manager.orderFilters;
+  const orders = state.orders.filter((order) => order.restaurantId === restaurant.id)
+    .filter((order) => filters.status === 'ALL' ? true : order.status === filters.status)
+    .filter((order) => filters.type === 'ALL' ? true : order.type === filters.type)
+    .filter((order) => {
+      if (filters.range === 'TODAY') {
+        const today = new Date().toISOString().slice(0, 10);
+        return order.createdAt.startsWith(today);
+      }
+      return true;
+    });
+  const selectedOrder = orders.find((order) => order.id === state.ui.manager.selectedOrderId) || null;
+
+  return `
+    <section class="card">
+      <header>
+        <h2>Unified orders dashboard</h2>
+        <p>Monitor dine-in, pre-order, and delivery requests. Update status manually as work progresses.</p>
+      </header>
+      <div class="grid-three">
+        <label>
+          Status filter
+          <select data-field="manager-status">
+            ${['ALL', 'RECEIVED', 'IN_PREP', 'READY', 'COMPLETED', 'CANCELLED'].map((status) => `<option value="${status}" ${filters.status === status ? 'selected' : ''}>${status}</option>`).join('')}
+          </select>
+        </label>
+        <label>
+          Type filter
+          <select data-field="manager-type">
+            ${['ALL', 'TABLE', 'PREORDER', 'DELIVERY'].map((type) => `<option value="${type}" ${filters.type === type ? 'selected' : ''}>${type}</option>`).join('')}
+          </select>
+        </label>
+        <label>
+          Time window
+          <select data-field="manager-range">
+            <option value="TODAY" ${filters.range === 'TODAY' ? 'selected' : ''}>Today</option>
+            <option value="ALL" ${filters.range === 'ALL' ? 'selected' : ''}>All history</option>
+          </select>
+        </label>
+      </div>
+      <div class="table-wrapper" style="margin-top:1.25rem">
+        <table>
+          <thead>
+            <tr>
+              <th>Code</th>
+              <th>Type</th>
+              <th>Customer / Table</th>
+              <th>Items</th>
+              <th>Status</th>
+              <th>Created</th>
+              <th></th>
+            </tr>
+          </thead>
+          <tbody>
+            ${orders.length === 0 ? '<tr><td colspan="7">No orders match the filters.</td></tr>'
+              : orders.map((order) => {
+                const customer = state.users.find((u) => u.id === order.customerId);
+                const table = order.tableId ? state.tables.find((t) => t.id === order.tableId)?.label : '-';
+                return `
+                  <tr>
+                    <td>${order.code}</td>
+                    <td>${order.type}</td>
+                    <td>${order.type === 'TABLE' ? table : (customer?.name || 'Guest')}</td>
+                    <td>${order.items.length}</td>
+                    <td><span class="tag">${order.status}</span></td>
+                    <td>${formatDate(order.createdAt)}</td>
+                    <td><button class="link" data-action="select-order" data-id="${order.id}">Open</button></td>
+                  </tr>
+                `;
+              }).join('')}
+          </tbody>
+        </table>
+      </div>
+    </section>
+    ${selectedOrder ? renderOrderDetail(selectedOrder, state) : ''}
+  `;
+}
+function renderOrderDetail(order, state) {
+  const customer = state.users.find((user) => user.id === order.customerId);
+  const table = order.tableId ? state.tables.find((t) => t.id === order.tableId)?.label : '-';
+  const nextStatus = order.status === 'RECEIVED' ? 'IN_PREP'
+    : order.status === 'IN_PREP' ? 'READY'
+      : order.status === 'READY' ? (order.type === 'DELIVERY' ? 'READY' : 'COMPLETED')
+        : null;
+  const canAssignDriver = order.type === 'DELIVERY' && order.status === 'READY';
+  return `
+    <section class="card">
+      <header>
+        <h3>${order.code}</h3>
+        <p>${order.type === 'TABLE' ? `Table ${table}` : order.type === 'PREORDER' ? `Pre-order for ${order.schedule?.date} ${order.schedule?.time}` : 'Delivery order'}</p>
+      </header>
+      <section class="grid-two">
+        <div>
+          <h4>Items</h4>
+          <ul>
+            ${order.items.map((item) => `<li>${item.quantity} × ${item.name} (${formatCurrency(item.price)})</li>`).join('')}
+          </ul>
+          <p><strong>Total:</strong> ${formatCurrency(order.total)}</p>
+        </div>
+        <div>
+          <h4>Details</h4>
+          ${order.type === 'DELIVERY' ? `
+            <p><strong>Deliver to:</strong> ${order.deliveryAddress?.recipient}</p>
+            <p>${order.deliveryAddress?.line1} · ${order.deliveryAddress?.neighborhood}</p>
+            <p>${order.deliveryAddress?.phone}</p>
+          ` : ''}
+          ${order.type === 'TABLE' ? `<p><strong>Table:</strong> ${table}</p>` : ''}
+          ${order.type === 'PREORDER' ? `<p><strong>Timeslot:</strong> ${order.schedule?.date} ${order.schedule?.time}</p>` : ''}
+          <p><strong>Customer:</strong> ${customer?.name || 'Guest'}</p>
+        </div>
+      </section>
+      <div class="timeline" style="margin-top:1rem">
+        ${getOrderTimeline(order).map((item) => `
+          <div class="timeline-item ${item.status === order.status ? 'current' : ''}">
+            <strong>${statusLabels[item.status] || item.status}</strong>
+            <span>${item.note}</span>
+            <span class="helper-text">${formatDate(item.at)}</span>
+          </div>
+        `).join('')}
+      </div>
+      <div class="actions" style="margin-top:1rem">
+        ${nextStatus && !(order.type === 'DELIVERY' && order.status === 'READY') ? `<button class="secondary" data-action="advance-status" data-id="${order.id}">Mark ${statusLabels[nextStatus]}</button>` : ''}
+        ${canAssignDriver ? '<button class="primary" data-action="open-assign-driver" data-id="' + order.id + '">Assign driver</button>' : ''}
+        ${order.status !== 'CANCELLED' && order.status !== 'COMPLETED' && order.status !== 'DELIVERED' ? `<button class="ghost" data-action="cancel-order" data-id="${order.id}">Cancel order</button>` : ''}
+      </div>
+    </section>
+  `;
+}
+
+function renderDeliveryAssignment(state, user) {
+  const restaurant = getManagerRestaurant(state, user);
+  if (!restaurant) {
+    return '<section class="card"><p>No restaurant assigned.</p></section>';
+  }
+  const readyDeliveries = state.orders.filter((order) => order.restaurantId === restaurant.id && order.type === 'DELIVERY' && order.status === 'READY');
+  const assignments = state.deliveries.filter((delivery) => state.orders.find((order) => order.id === delivery.orderId)?.restaurantId === restaurant.id);
+  const drivers = state.staff.filter((staff) => staff.restaurantId === restaurant.id && staff.role.toLowerCase() === 'driver')
+    .map((staff) => ({
+      staff,
+      user: state.users.find((user) => user.id === staff.userId),
+      status: state.driverStatus[staff.userId] || { available: false }
+    }));
+
+  return `
+    <section class="card">
+      <header>
+        <h2>Manual delivery dispatch</h2>
+        <p>Assign READY delivery orders to available drivers. Drivers accept or decline in their app.</p>
+      </header>
+      <div class="grid-two">
+        <div>
+          <h3>Ready to assign</h3>
+          ${readyDeliveries.length === 0 ? '<div class="empty-state">No READY delivery orders.</div>'
+            : readyDeliveries.map((order) => `
+                <div class="timeline-item">
+                  <strong>${order.code}</strong>
+                  <span>${order.deliveryAddress?.line1 || ''}</span>
+                  <span class="helper-text">${formatCurrency(order.total)}</span>
+                  <div class="actions">
+                    <button class="primary" data-action="assign-driver" data-id="${order.id}">Assign driver</button>
+                  </div>
+                </div>
+              `).join('')}
+        </div>
+        <div>
+          <h3>Drivers</h3>
+          ${drivers.length === 0 ? '<div class="empty-state">No drivers on roster. Add drivers from Staff & shifts.</div>'
+            : drivers.map(({ staff, user, status }) => `
+                <div class="timeline-item">
+                  <strong>${user?.name || 'Driver'}</strong>
+                  <span>Status: ${staff.status}</span>
+                  <span class="helper-text">Availability: ${status.available ? 'Available' : 'Unavailable'}</span>
+                </div>
+              `).join('')}
+        </div>
+      </div>
+    </section>
+    <section class="card">
+      <header>
+        <h2>Active deliveries</h2>
+        <p>Track accept/decline and milestone progress.</p>
+      </header>
+      ${assignments.length === 0 ? '<div class="empty-state">No deliveries yet.</div>'
+        : assignments.map((delivery) => {
+            const order = state.orders.find((order) => order.id === delivery.orderId);
+            const driver = state.users.find((user) => user.id === delivery.driverId);
+            return `
+              <div class="timeline-item">
+                <strong>${order?.code || delivery.orderId}</strong>
+                <span>Driver: ${driver?.name || 'Unassigned'}</span>
+                <span class="helper-text">${delivery.history.map((entry) => `${statusLabels[entry.status] || entry.status} @ ${formatDate(entry.at)}`).join(' · ')}</span>
+              </div>
+            `;
+          }).join('')}
+    </section>
+  `;
+}
+
+function renderFloorPlan(state, user) {
+  const restaurant = getManagerRestaurant(state, user);
+  if (!restaurant) return '';
+  const tables = state.tables.filter((table) => table.restaurantId === restaurant.id);
+  return `
+    <section class="card">
+      <header>
+        <h2>Floor plan & tables</h2>
+        <p>Manage table states: Free, Held, Seated, Cleaning. Seat, move, merge, split, or free tables.</p>
+      </header>
+      <div class="grid-two">
+        ${tables.map((table) => `
+          <div class="timeline-item ${table.id === state.ui.manager.selectedTableId ? 'current' : ''}">
+            <strong>${table.label}</strong>
+            <span>Capacity: ${table.capacity}</span>
+            <span class="helper-text">State: ${table.state}</span>
+            <div class="actions">
+              <button class="ghost" data-action="select-table" data-id="${table.id}">Manage</button>
+            </div>
+          </div>
+        `).join('')}
+      </div>
+    </section>
+    ${state.ui.manager.selectedTableId ? renderTableControls(state, state.ui.manager.selectedTableId) : ''}
+  `;
+}
+
+function renderTableControls(state, tableId) {
+  const table = state.tables.find((table) => table.id === tableId);
+  if (!table) return '';
+  return `
+    <section class="card">
+      <header>
+        <h3>${table.label} controls</h3>
+        <p>Adjust state or link orders.</p>
+      </header>
+      <div class="actions">
+        ${['FREE', 'HELD', 'SEATED', 'CLEANING'].map((stateName) => `<button class="ghost" data-action="set-table-state" data-id="${table.id}" data-state="${stateName}">${stateName}</button>`).join('')}
+      </div>
+      <p class="helper-text">Table can be linked to in-house tickets by setting state to SEATED and selecting the relevant order.</p>
+    </section>
+  `;
+}
+
+function renderReservationsBoard(state, user) {
+  const restaurant = getManagerRestaurant(state, user);
+  if (!restaurant) return '';
+  const reservations = state.reservations.filter((reservation) => reservation.restaurantId === restaurant.id);
+  return `
+    <section class="card">
+      <header>
+        <h2>Reservations board</h2>
+        <p>Create, confirm, cancel, or seat reservations.</p>
+      </header>
+      <form data-form="manager-reservation">
+        <div class="grid-two">
+          <label>
+            Customer email
+            <input name="email" placeholder="customer@example.com" required />
+          </label>
+          <label>
+            Date
+            <input type="date" name="date" required />
+          </label>
+        </div>
+        <div class="grid-two">
+          <label>
+            Time
+            <input type="time" name="time" required />
+          </label>
+          <label>
+            Party size
+            <input type="number" name="partySize" min="1" max="12" required />
+          </label>
+        </div>
+        <label>
+          Notes
+          <input name="notes" placeholder="Optional notes" />
+        </label>
+        <div class="actions">
+          <button class="secondary" type="submit">Create reservation</button>
+        </div>
+      </form>
+    </section>
+    <section class="card">
+      <header>
+        <h2>Upcoming reservations</h2>
+      </header>
+      ${reservations.length === 0 ? '<div class="empty-state">No reservations yet.</div>'
+        : reservations.map((reservation) => `
+            <div class="timeline-item ${reservation.id === state.ui.manager.selectedReservationId ? 'current' : ''}">
+              <strong>${reservation.date} ${reservation.time}</strong>
+              <span>Party of ${reservation.partySize} · ${reservation.status}</span>
+              <span class="helper-text">${reservation.notes || 'No notes'} · Table ${reservation.tableId ? state.tables.find((table) => table.id === reservation.tableId)?.label : 'Unassigned'}</span>
+              <div class="actions">
+                <button class="ghost" data-action="select-reservation" data-id="${reservation.id}">Manage</button>
+              </div>
+            </div>
+          `).join('')}
+    </section>
+    ${state.ui.manager.selectedReservationId ? renderReservationControls(state, state.ui.manager.selectedReservationId) : ''}
+  `;
+}
+function renderReservationControls(state, reservationId) {
+  const reservation = state.reservations.find((reservation) => reservation.id === reservationId);
+  if (!reservation) return '';
+  const tables = state.tables.filter((table) => table.restaurantId === reservation.restaurantId);
+  return `
+    <section class="card">
+      <header>
+        <h3>Reservation controls</h3>
+        <p>Confirm, cancel, or seat the reservation at a table.</p>
+      </header>
+      <div class="actions">
+        <button class="secondary" data-action="confirm-reservation" data-id="${reservation.id}">Confirm</button>
+        <button class="ghost" data-action="cancel-reservation-manager" data-id="${reservation.id}">Cancel</button>
+      </div>
+      <form data-form="seat-reservation" data-id="${reservation.id}" style="margin-top:1rem">
+        <label>
+          Seat at table
+          <select name="tableId" required>
+            ${tables.map((table) => `<option value="${table.id}" ${reservation.tableId === table.id ? 'selected' : ''}>${table.label}</option>`).join('')}
+          </select>
+        </label>
+        <div class="actions" style="margin-top:0.75rem">
+          <button class="primary" type="submit">Seat party</button>
+        </div>
+      </form>
+    </section>
+  `;
+}
+
+function renderMenuManagement(state, user) {
+  if (user.role !== 'manager') {
+    return '<section class="card"><p>Only restaurant managers can manage the menu. Contact a manager for updates.</p></section>';
+  }
+  const restaurant = getManagerRestaurant(state, user);
+  if (!restaurant) return '';
+  const items = state.menuItems.filter((item) => item.restaurantId === restaurant.id);
+  return `
+    <section class="card">
+      <header>
+        <h2>Menu management</h2>
+        <p>Add, edit, or publish menu items. Changes apply immediately.</p>
+      </header>
+      <form data-form="add-menu-item">
+        <div class="grid-two">
+          <label>
+            Name
+            <input name="name" required />
+          </label>
+          <label>
+            Category
+            <input name="category" required />
+          </label>
+        </div>
+        <div class="grid-two">
+          <label>
+            Price
+            <input name="price" type="number" min="0" step="0.01" required />
+          </label>
+          <label>
+            Availability
+            <select name="available">
+              <option value="true">Available</option>
+              <option value="false">Unavailable</option>
+            </select>
+          </label>
+        </div>
+        <label>
+          Description
+          <textarea name="description" rows="2" placeholder="Item description" required></textarea>
+        </label>
+        <label>
+          Modifiers (comma separated)
+          <input name="modifiers" placeholder="Extra sauce, Add avocado" />
+        </label>
+        <div class="actions">
+          <button class="secondary" type="submit">Add item</button>
+        </div>
+      </form>
+    </section>
+    <section class="card">
+      <header>
+        <h2>Published items</h2>
+      </header>
+      <div class="table-wrapper">
+        <table>
+          <thead>
+            <tr>
+              <th>Name</th>
+              <th>Category</th>
+              <th>Price</th>
+              <th>Availability</th>
+              <th></th>
+            </tr>
+          </thead>
+          <tbody>
+            ${items.length === 0 ? '<tr><td colspan="5">No items yet.</td></tr>'
+              : items.map((item) => `
+                  <tr>
+                    <td>${item.name}</td>
+                    <td>${item.category}</td>
+                    <td>${formatCurrency(item.price)}</td>
+                    <td>${item.available ? 'Available' : 'Unavailable'}</td>
+                    <td><button class="link" data-action="delete-menu-item" data-id="${item.id}">Remove</button></td>
+                  </tr>
+                `).join('')}
+          </tbody>
+        </table>
+      </div>
+    </section>
+  `;
+}
+
+function renderStaffManagement(state, user) {
+  const restaurant = getManagerRestaurant(state, user);
+  if (!restaurant) return '';
+  const roster = state.staff.filter((staff) => staff.restaurantId === restaurant.id)
+    .map((staff) => ({
+      staff,
+      user: state.users.find((user) => user.id === staff.userId)
+    }));
+  const shifts = state.shifts.filter((shift) => shift.restaurantId === restaurant.id);
+
+  return `
+    <section class="card">
+      <header>
+        <h2>Staff roster</h2>
+        <p>Managers register staff members here. Create accounts for servers, kitchen, drivers, or other roles.</p>
+      </header>
+      <form data-form="add-staff">
+        <div class="grid-two">
+          <label>
+            Full name
+            <input name="name" required />
+          </label>
+          <label>
+            Email
+            <input name="email" type="email" required />
+          </label>
+        </div>
+        <div class="grid-two">
+          <label>
+            Role
+            <select name="role" required>
+              <option value="server">Server</option>
+              <option value="kitchen">Kitchen</option>
+              <option value="driver">Driver</option>
+              <option value="manager">Manager</option>
+            </select>
+          </label>
+          <label>
+            Phone
+            <input name="phone" />
+          </label>
+        </div>
+        <label>
+          Temporary password
+          <input name="password" type="password" value="welcome123!" required />
+        </label>
+        <div class="actions">
+          <button class="secondary" type="submit">Register staff</button>
+        </div>
+      </form>
+    </section>
+    <section class="card">
+      <header>
+        <h2>Active staff</h2>
+      </header>
+      ${roster.length === 0 ? '<div class="empty-state">No staff yet.</div>'
+        : roster.map(({ staff, user }) => `
+            <div class="timeline-item">
+              <strong>${user?.name || 'Staff member'} (${staff.role})</strong>
+              <span>Status: ${staff.status}</span>
+              <span class="helper-text">${user?.email || ''} · ${user?.phone || 'N/A'}</span>
+              <div class="actions">
+                <button class="ghost" data-action="toggle-staff" data-id="${staff.id}">Toggle active</button>
+                <button class="link" data-action="remove-staff" data-id="${staff.id}">Remove</button>
+              </div>
+            </div>
+          `).join('')}
+    </section>
+    <section class="card">
+      <header>
+        <h2>Shifts</h2>
+      </header>
+      <form data-form="add-shift">
+        <div class="grid-two">
+          <label>
+            Staff member
+            <select name="staffId" required>
+              ${roster.map(({ staff, user }) => `<option value="${staff.id}">${user?.name || staff.role}</option>`).join('')}
+            </select>
+          </label>
+          <label>
+            Date
+            <input type="date" name="date" required />
+          </label>
+        </div>
+        <div class="grid-two">
+          <label>
+            Start time
+            <input type="time" name="start" required />
+          </label>
+          <label>
+            End time
+            <input type="time" name="end" required />
+          </label>
+        </div>
+        <label>
+          Notes
+          <input name="notes" placeholder="Shift notes" />
+        </label>
+        <div class="actions">
+          <button class="primary" type="submit">Add shift</button>
+        </div>
+      </form>
+      <div class="timeline" style="margin-top:1.25rem">
+        ${shifts.length === 0 ? '<div class="empty-state">No shifts scheduled.</div>'
+          : shifts.map((shift) => {
+              const staff = roster.find(({ staff }) => staff.id === shift.staffId);
+              return `
+                <div class="timeline-item">
+                  <strong>${staff?.user?.name || 'Staff'} · ${shift.date}</strong>
+                  <span>${shift.start} - ${shift.end}</span>
+                  <span class="helper-text">${shift.notes || 'No notes'}</span>
+                </div>
+              `;
+            }).join('')}
+      </div>
+    </section>
+  `;
+}
+function renderAnnouncements(state, user) {
+  const restaurant = getManagerRestaurant(state, user);
+  const messages = state.announcements.filter((msg) => msg.restaurantId === restaurant?.id);
+  return `
+    <section class="card">
+      <header>
+        <h2>In-app announcements</h2>
+        <p>Post targeted messages to staff. Messages show in inboxes when staff open the app.</p>
+      </header>
+      <form data-form="create-announcement">
+        <div class="grid-two">
+          <label>
+            Title
+            <input name="title" required />
+          </label>
+          <label>
+            Audience
+            <select name="scope">
+              <option value="ALL">All staff</option>
+              <option value="MANAGER">Managers</option>
+              <option value="SERVER">Servers</option>
+              <option value="DRIVER">Drivers</option>
+              <option value="INDIVIDUAL">Specific user</option>
+            </select>
+          </label>
+        </div>
+        <label>
+          Target email (only for individual)
+          <input name="target" placeholder="user@example.com" />
+        </label>
+        <label>
+          Message
+          <textarea name="body" rows="3" required></textarea>
+        </label>
+        <div class="actions">
+          <button class="secondary" type="submit">Post announcement</button>
+        </div>
+      </form>
+    </section>
+    <section class="card">
+      <header>
+        <h2>Announcement history</h2>
+      </header>
+      <div class="timeline">
+        ${messages.length === 0 ? '<div class="empty-state">No announcements yet.</div>'
+          : messages.map((msg) => `
+            <div class="timeline-item">
+              <strong>${msg.title}</strong>
+              <span>${msg.body}</span>
+              <span class="helper-text">Scope: ${msg.scope} · ${formatDate(msg.createdAt)}</span>
+            </div>
+          `).join('')}
+      </div>
+    </section>
+  `;
+}
+
+function renderSettingsReports(state, user) {
+  const restaurant = getManagerRestaurant(state, user);
+  if (!restaurant) return '';
+  const orders = state.orders.filter((order) => order.restaurantId === restaurant.id);
+  const completed = orders.filter((order) => ['COMPLETED', 'DELIVERED'].includes(order.status)).length;
+  const byType = orders.reduce((acc, order) => {
+    acc[order.type] = (acc[order.type] || 0) + 1;
+    return acc;
+  }, {});
+  const deliveryAssignments = state.deliveries.filter((delivery) => state.orders.find((order) => order.id === delivery.orderId)?.restaurantId === restaurant.id);
+  return `
+    <section class="card">
+      <header>
+        <h2>Restaurant settings</h2>
+        <p>Update profile, hours, and service rules including delivery zones and pre-order lead time.</p>
+      </header>
+      <form data-form="update-settings">
+        <label>
+          Restaurant name
+          <input name="name" value="${restaurant.name}" required />
+        </label>
+        <label>
+          Phone
+          <input name="phone" value="${restaurant.phone}" />
+        </label>
+        <label>
+          Service zones (comma separated)
+          <input name="zones" value="${restaurant.serviceRules.deliveryZones.join(', ')}" />
+        </label>
+        <label>
+          Pre-order lead time (minutes)
+          <input name="lead" type="number" min="0" value="${restaurant.serviceRules.preorderLeadMinutes}" />
+        </label>
+        <div class="actions">
+          <button class="secondary" type="submit">Save settings</button>
+        </div>
+      </form>
+    </section>
+    <section class="card">
+      <header>
+        <h2>Reports snapshot</h2>
+      </header>
+      <div class="grid-three">
+        <div class="timeline-item">
+          <strong>Total orders</strong>
+          <span>${orders.length}</span>
+        </div>
+        <div class="timeline-item">
+          <strong>Completed / Delivered</strong>
+          <span>${completed}</span>
+        </div>
+        <div class="timeline-item">
+          <strong>Delivery assignments</strong>
+          <span>${deliveryAssignments.length}</span>
+        </div>
+      </div>
+      <h3 style="margin-top:1.5rem">Orders by type</h3>
+      <div class="grid-three">
+        ${['TABLE', 'PREORDER', 'DELIVERY'].map((type) => `
+          <div class="timeline-item">
+            <strong>${type}</strong>
+            <span>${byType[type] || 0}</span>
+          </div>
+        `).join('')}
+      </div>
+    </section>
+  `;
+}
+
+function renderDriver(state, user) {
+  const nav = renderNavigation('driver', state.ui.driver.section, [
+    { id: 'availability', label: 'Availability' },
+    { id: 'jobs', label: 'Assigned jobs' },
+    { id: 'history', label: 'History' },
+    { id: 'inbox', label: 'Inbox' },
+    { id: 'profile', label: 'Profile' }
+  ]);
+
+  let body = '';
+  switch (state.ui.driver.section) {
+    case 'availability':
+      body = renderDriverAvailability(state, user);
+      break;
+    case 'jobs':
+      body = renderDriverJobs(state, user);
+      break;
+    case 'history':
+      body = renderDriverHistory(state, user);
+      break;
+    case 'inbox':
+      body = renderDriverInbox(state, user);
+      break;
+    case 'profile':
+      body = renderDriverProfile(state, user);
+      break;
+    default:
+      body = '<section class="card"><p>Section coming soon.</p></section>';
+  }
+
+  return `
+    ${renderHeader('Delivery app', 'Toggle availability, manage assignments, and update milestones.', user)}
+    ${nav}
+    ${body}
+  `;
+}
+
+function getDriverAssignments(state, user) {
+  return state.deliveries.filter((delivery) => delivery.driverId === user.id)
+    .map((delivery) => ({
+      delivery,
+      order: state.orders.find((order) => order.id === delivery.orderId)
+    }));
+}
+
+function renderDriverAvailability(state, user) {
+  const status = state.driverStatus[user.id] || { available: false };
+  const assignments = getDriverAssignments(state, user).filter(({ order }) => order && ['READY', 'PICKED_UP', 'OUT_FOR_DELIVERY'].includes(order.status));
+  return `
+    <section class="card">
+      <header>
+        <h2>Availability</h2>
+        <p>Toggle availability to receive manual assignments. Managers see availability in dispatch.</p>
+      </header>
+      <div class="actions">
+        <button class="${status.available ? 'secondary' : 'primary'}" data-action="toggle-availability">${status.available ? 'Set unavailable' : 'Set available'}</button>
+        <span class="helper-text">Active jobs today: ${assignments.length}</span>
+      </div>
+    </section>
+  `;
+}
+
+function renderDriverJobs(state, user) {
+  const assignments = getDriverAssignments(state, user).filter(({ order }) => order && !['DELIVERED', 'FAILED', 'COMPLETED'].includes(order.status));
+  return `
+    <section class="card">
+      <header>
+        <h2>Assigned jobs</h2>
+        <p>Accept or decline new assignments, then update milestones as you progress.</p>
+      </header>
+      ${assignments.length === 0 ? '<div class="empty-state">No active jobs.</div>'
+        : assignments.map(({ delivery, order }) => `
+            <div class="timeline-item ${delivery.id === state.ui.driver.selectedDeliveryId ? 'current' : ''}">
+              <strong>${order?.code || delivery.orderId}</strong>
+              <span>${order?.deliveryAddress?.line1 || 'Pickup only'} · ${order?.deliveryAddress?.phone || ''}</span>
+              <span class="helper-text">Status: ${order?.status}</span>
+              <div class="actions">
+                <button class="ghost" data-action="select-delivery" data-id="${delivery.id}">Open job</button>
+              </div>
+            </div>
+          `).join('')}
+    </section>
+    ${state.ui.driver.selectedDeliveryId ? renderDriverJobDetail(state, user, state.ui.driver.selectedDeliveryId) : ''}
+  `;
+}
+
+function renderDriverJobDetail(state, user, deliveryId) {
+  const delivery = state.deliveries.find((delivery) => delivery.id === deliveryId && delivery.driverId === user.id);
+  if (!delivery) return '';
+  const order = state.orders.find((order) => order.id === delivery.orderId);
+  const timeline = delivery.history.map((entry) => `${statusLabels[entry.status] || entry.status} @ ${formatDate(entry.at)}${entry.note ? ` · ${entry.note}` : ''}`).join(' \u2022 ');
+  return `
+    <section class="card">
+      <header>
+        <h3>${order?.code || delivery.orderId}</h3>
+        <p>${order?.deliveryAddress?.line1 || 'Pickup only'} · ${order?.deliveryAddress?.recipient || ''}</p>
+      </header>
+      <p><strong>Restaurant contact:</strong> ${deriveRestaurantForUser(state, user)?.phone || 'N/A'}</p>
+      <p class="helper-text">${timeline || 'No updates yet.'}</p>
+      <div class="actions">
+        ${delivery.accepted === null ? `
+          <button class="primary" data-action="accept-delivery" data-id="${delivery.id}">Accept</button>
+          <button class="ghost" data-action="decline-delivery" data-id="${delivery.id}">Decline</button>
+        ` : ''}
+        <button class="ghost" data-action="mark-delivery" data-id="${delivery.id}" data-status="PICKED_UP">Picked-up</button>
+        <button class="ghost" data-action="mark-delivery" data-id="${delivery.id}" data-status="OUT_FOR_DELIVERY">Out-for-delivery</button>
+        <button class="secondary" data-action="mark-delivery" data-id="${delivery.id}" data-status="DELIVERED">Delivered</button>
+        <button class="link" data-action="mark-delivery" data-id="${delivery.id}" data-status="FAILED">Failed</button>
+      </div>
+    </section>
+  `;
+}
+
+function renderDriverHistory(state, user) {
+  const assignments = getDriverAssignments(state, user).filter(({ order }) => order && ['DELIVERED', 'FAILED', 'COMPLETED'].includes(order.status));
+  return `
+    <section class="card">
+      <header>
+        <h2>Delivery history</h2>
+      </header>
+      ${assignments.length === 0 ? '<div class="empty-state">No history yet.</div>'
+        : assignments.map(({ delivery, order }) => `
+            <div class="timeline-item">
+              <strong>${order?.code || delivery.orderId}</strong>
+              <span>Status: ${order?.status}</span>
+              <span class="helper-text">${formatDate(order?.createdAt)} · ${delivery.history.map((entry) => statusLabels[entry.status] || entry.status).join(' → ')}</span>
+            </div>
+          `).join('')}
+    </section>
+  `;
+}
+
+function renderDriverInbox(state, user) {
+  const restaurant = deriveRestaurantForUser(state, user);
+  const messages = state.announcements.filter((msg) => {
+    if (msg.restaurantId && msg.restaurantId !== restaurant?.id) return false;
+    if (msg.scope === 'ALL') return true;
+    if (msg.scope === 'DRIVER') return true;
+    if (msg.scope === 'INDIVIDUAL') {
+      const targetUser = state.users.find((u) => u.email === msg.targetEmail);
+      return targetUser?.id === user.id;
+    }
+    return false;
+  });
+  return `
+    <section class="card">
+      <header>
+        <h2>Inbox</h2>
+        <p>Messages appear here when posted by managers. No push notifications are sent.</p>
+      </header>
+      <div class="timeline">
+        ${messages.length === 0 ? '<div class="empty-state">No announcements yet.</div>'
+          : messages.map((msg) => `
+            <div class="timeline-item">
+              <strong>${msg.title}</strong>
+              <span>${msg.body}</span>
+              <span class="helper-text">${formatDate(msg.createdAt)}</span>
+            </div>
+          `).join('')}
+      </div>
+    </section>
+  `;
+}
+
+function renderDriverProfile(state, user) {
+  return `
+    <section class="card">
+      <header>
+        <h2>Profile</h2>
+      </header>
+      <p><strong>Name:</strong> ${user.name}</p>
+      <p><strong>Phone:</strong> ${user.phone || 'N/A'}</p>
+      <p><strong>Email:</strong> ${user.email}</p>
+      <div class="actions">
+        <button class="ghost" data-action="logout">Sign out</button>
+      </div>
+    </section>
+  `;
+}
+function renderAdmin(state, user) {
+  const nav = renderNavigation('admin', state.ui.admin.section, [
+    { id: 'restaurants', label: 'Restaurants' },
+    { id: 'users', label: 'Users & roles' },
+    { id: 'oversight', label: 'Data oversight' },
+    { id: 'logs', label: 'Governance & logs' }
+  ]);
+
+  let body = '';
+  switch (state.ui.admin.section) {
+    case 'restaurants':
+      body = renderAdminRestaurants(state, user);
+      break;
+    case 'users':
+      body = renderAdminUsers(state, user);
+      break;
+    case 'oversight':
+      body = renderAdminOversight(state, user);
+      break;
+    case 'logs':
+      body = renderAdminLogs(state, user);
+      break;
+    default:
+      body = '<section class="card"><p>Section coming soon.</p></section>';
+  }
+
+  return `
+    ${renderHeader('Platform administration', 'Manage restaurants, users, and governance activities.', user)}
+    ${nav}
+    ${body}
+  `;
+}
+
+function renderAdminRestaurants(state, user) {
+  return `
+    <section class="card">
+      <header>
+        <h2>Restaurants</h2>
+        <p>Create, edit, or disable restaurants.</p>
+      </header>
+      <form data-form="add-restaurant">
+        <label>
+          Name
+          <input name="name" required />
+        </label>
+        <label>
+          Location
+          <input name="location" required />
+        </label>
+        <label>
+          Phone
+          <input name="phone" />
+        </label>
+        <div class="actions">
+          <button class="secondary" type="submit">Add restaurant</button>
+        </div>
+      </form>
+    </section>
+    <section class="card">
+      <header>
+        <h2>Existing restaurants</h2>
+      </header>
+      ${state.restaurants.length === 0 ? '<div class="empty-state">No restaurants configured.</div>'
+        : state.restaurants.map((restaurant) => `
+            <div class="timeline-item">
+              <strong>${restaurant.name}</strong>
+              <span>${restaurant.location} · ${restaurant.phone}</span>
+              <span class="helper-text">Status: ${restaurant.status}</span>
+              <div class="actions">
+                <button class="ghost" data-action="select-restaurant" data-id="${restaurant.id}">Edit</button>
+                <button class="link" data-action="toggle-restaurant" data-id="${restaurant.id}">Toggle status</button>
+              </div>
+            </div>
+          `).join('')}
+    </section>
+  `;
+}
+
+function renderAdminUsers(state, user) {
+  const filter = state.ui.admin.userRoleFilter;
+  const filteredUsers = state.users.filter((candidate) => filter === 'ALL' ? true : candidate.role === filter.toLowerCase());
+  return `
+    <section class="card">
+      <header>
+        <h2>Users & roles</h2>
+        <p>Promote, demote, or disable users. Managers register staff from the restaurant view.</p>
+      </header>
+      <div class="grid-two">
+        <label>
+          Role filter
+          <select data-field="admin-role-filter">
+            <option value="ALL" ${filter === 'ALL' ? 'selected' : ''}>All</option>
+            <option value="CUSTOMER" ${filter === 'CUSTOMER' ? 'selected' : ''}>Customers</option>
+            <option value="MANAGER" ${filter === 'MANAGER' ? 'selected' : ''}>Managers</option>
+            <option value="DRIVER" ${filter === 'DRIVER' ? 'selected' : ''}>Drivers</option>
+            <option value="SERVER" ${filter === 'SERVER' ? 'selected' : ''}>Servers</option>
+            <option value="ADMIN" ${filter === 'ADMIN' ? 'selected' : ''}>Admins</option>
+          </select>
+        </label>
+      </div>
+      <div class="timeline" style="margin-top:1.25rem">
+        ${filteredUsers.length === 0 ? '<div class="empty-state">No users found.</div>'
+          : filteredUsers.map((candidate) => `
+            <div class="timeline-item">
+              <strong>${candidate.name}</strong>
+              <span>${candidate.email} · ${candidate.role.toUpperCase()}</span>
+              <div class="actions">
+                <button class="ghost" data-action="change-role" data-id="${candidate.id}">Change role</button>
+                <button class="link" data-action="remove-user" data-id="${candidate.id}">Disable</button>
+              </div>
+            </div>
+          `).join('')}
+      </div>
+    </section>
+  `;
+}
+
+function renderAdminOversight(state, user) {
+  return `
+    <section class="card">
+      <header>
+        <h2>System-wide data</h2>
+        <p>Read-only access to orders, deliveries, reservations, and menu items.</p>
+      </header>
+      <div class="grid-two">
+        <div>
+          <h3>Orders</h3>
+          <p>${state.orders.length} total orders.</p>
+        </div>
+        <div>
+          <h3>Deliveries</h3>
+          <p>${state.deliveries.length} delivery records.</p>
+        </div>
+      </div>
+      <div class="grid-two" style="margin-top:1rem">
+        <div>
+          <h3>Reservations</h3>
+          <p>${state.reservations.length} reservations.</p>
+        </div>
+        <div>
+          <h3>Menu items</h3>
+          <p>${state.menuItems.length} menu entries.</p>
+        </div>
+      </div>
+      <div class="actions" style="margin-top:1.25rem">
+        <button class="ghost" data-action="export-csv">Export CSV snapshot</button>
+      </div>
+    </section>
+  `;
+}
+
+function renderAdminLogs(state, user) {
+  return `
+    <section class="card">
+      <header>
+        <h2>Governance & logs</h2>
+        <p>Audit recent status changes, assignments, and configuration updates.</p>
+      </header>
+      <div class="timeline">
+        ${state.logs.length === 0 ? '<div class="empty-state">No activity logged yet.</div>'
+          : state.logs.map((log) => {
+              const actor = state.users.find((candidate) => candidate.id === log.actorId);
+              return `
+                <div class="timeline-item">
+                  <strong>${log.type}</strong>
+                  <span>${log.message}</span>
+                  <span class="helper-text">${formatDate(log.createdAt)} · ${actor?.name || 'Unknown'}</span>
+                </div>
+              `;
+            }).join('')}
+      </div>
+    </section>
+  `;
+}
+
+function renderUnknownRole(state, user) {
+  return `
+    ${renderHeader('Servesoft', 'Role not recognized. Contact an administrator.', user)}
+    <section class="card">
+      <p>We were unable to determine your role. Please contact the Servesoft support team.</p>
+      <div class="actions">
+        <button class="ghost" data-action="logout">Logout</button>
+      </div>
+    </section>
+  `;
+}
+function mount() {
+  const root = document.getElementById('app');
+  if (!root) return;
+  store.subscribe((state) => {
+    root.innerHTML = renderApp(state);
+  });
+}
+
+mount();
+
+function updateFieldValue(field, value) {
+  store.setState((state) => {
+    if (field === 'customer-search') {
+      state.ui.customer.search = value;
+    } else if (field === 'customer-category') {
+      state.ui.customer.category = value;
+    } else if (field === 'consent') {
+      state.ui.customer.reviewConsent = !!value;
+    } else if (field === 'manager-status') {
+      state.ui.manager.orderFilters.status = value;
+    } else if (field === 'manager-type') {
+      state.ui.manager.orderFilters.type = value;
+    } else if (field === 'manager-range') {
+      state.ui.manager.orderFilters.range = value;
+    } else if (field === 'admin-role-filter') {
+      state.ui.admin.userRoleFilter = value;
+    }
+    return state;
+  });
+}
+
+document.addEventListener('click', (event) => {
+  const actionEl = event.target.closest('[data-action]');
+  if (!actionEl) return;
+  const action = actionEl.dataset.action;
+  if (!action) return;
+  event.preventDefault();
+
+  switch (action) {
+    case 'show-auth': {
+      const message = actionEl.dataset.message || '';
+      const mode = actionEl.dataset.mode || undefined;
+      showAuthPrompt(message, mode);
+      break;
+    }
+    case 'close-auth': {
+      hideAuthPrompt();
+      break;
+    }
+    case 'toggle-auth': {
+      const mode = actionEl.dataset.mode;
+      store.setState((state) => {
+        state.ui.authMode = mode;
+        state.ui.authVisible = true;
+        return state;
+      });
+      break;
+    }
+    case 'logout': {
+      store.setState((state) => {
+        state.currentUserId = null;
+        state.screen = { role: 'auth', section: 'login' };
+        state.ui.authVisible = false;
+        state.ui.authMessage = '';
+        return state;
+      });
+      break;
+    }
+    case 'switch-section': {
+      const role = actionEl.dataset.role;
+      const section = actionEl.dataset.section;
+      store.setState((state) => {
+        if (role === 'manager') {
+          const actingUser = getCurrentUser(state);
+          if (actingUser && actingUser.role !== 'manager' && section === 'menu') {
+            return state;
+          }
+        }
+        state.ui[role].section = section;
+        if (role === 'manager' && section !== 'orders') {
+          state.ui.manager.selectedOrderId = null;
+        }
+        if (role === 'driver' && section !== 'jobs') {
+          state.ui.driver.selectedDeliveryId = null;
+        }
+        if (role === 'customer' && section !== 'ordering') {
+          state.ui.customer.selectedItemId = null;
+          state.ui.customer.showReview = false;
+          state.ui.customer.reviewConsent = false;
+        }
+        return state;
+      });
+      break;
+    }
+    case 'open-item': {
+      const itemId = actionEl.dataset.item;
+      store.setState((state) => {
+        state.ui.customer.selectedItemId = itemId;
+        return state;
+      });
+      break;
+    }
+    case 'close-item': {
+      store.setState((state) => {
+        state.ui.customer.selectedItemId = null;
+        return state;
+      });
+      break;
+    }
+    case 'quick-add': {
+      const itemId = actionEl.dataset.item;
+      const actingUser = getCurrentUser(store.state);
+      if (!actingUser) {
+        showAuthPrompt('Sign in to add items to your cart.', 'login');
+        return;
+      }
+      store.setState((state) => {
+        const cart = ensureCart(state, actingUser.id);
+        const item = state.menuItems.find((candidate) => candidate.id === itemId);
+        if (item) {
+          const existing = cart.items.find((entry) => entry.menuId === item.id);
+          if (existing) {
+            existing.quantity += 1;
+          } else {
+            cart.items.push({
+              menuId: item.id,
+              name: item.name,
+              price: item.price,
+              quantity: 1,
+              modifiers: [],
+              notes: ''
+            });
+          }
+        }
+        return state;
+      });
+      break;
+    }
+    case 'edit-cart-item': {
+      const index = Number(actionEl.dataset.index);
+      const actingUser = getCurrentUser(store.state);
+      if (!actingUser) {
+        showAuthPrompt('Sign in to edit your cart.', 'login');
+        return;
+      }
+      store.setState((state) => {
+        const cart = ensureCart(state, actingUser.id);
+        const item = cart.items[index];
+        if (item) {
+          state.ui.customer.selectedItemId = item.menuId;
+        }
+        return state;
+      });
+      break;
+    }
+    case 'remove-cart-item': {
+      const index = Number(actionEl.dataset.index);
+      const actingUser = getCurrentUser(store.state);
+      if (!actingUser) {
+        showAuthPrompt('Sign in to update your cart.', 'login');
+        return;
+      }
+      store.setState((state) => {
+        const cart = ensureCart(state, actingUser.id);
+        cart.items.splice(index, 1);
+        return state;
+      });
+      break;
+    }
+    case 'force-order-type': {
+      store.setState((state) => {
+        state.ui.customer.showReview = false;
+        return state;
+      });
+      alert('Update the order type using the entry router above.');
+      break;
+    }
+    case 'review-order': {
+      if (!getCurrentUser(store.state)) {
+        showAuthPrompt('Sign in to review and submit your order.', 'login');
+        return;
+      }
+      store.setState((state) => {
+        state.ui.customer.showReview = true;
+        state.ui.customer.reviewConsent = false;
+        return state;
+      });
+      break;
+    }
+    case 'cancel-review': {
+      store.setState((state) => {
+        state.ui.customer.showReview = false;
+        state.ui.customer.reviewConsent = false;
+        return state;
+      });
+      break;
+    }
+    case 'submit-order': {
+      const actingUser = getCurrentUser(store.state);
+      if (!actingUser) {
+        showAuthPrompt('Sign in to submit your order.', 'login');
+        return;
+      }
+      store.setState((state) => {
+        const cart = ensureCart(state, actingUser.id);
+        if (!cart.orderType) return state;
+        if (!state.ui.customer.reviewConsent) return state;
+        if (cart.orderType === 'DELIVERY' && !cart.delivery.neighborhood) return state;
+        if (cart.orderType === 'PREORDER' && (!cart.schedule.date || !cart.schedule.time)) return state;
+        const order = createOrderFromCart(state, actingUser, cart);
+        state.orders.push(order);
+        state.logs.push({
+          id: `log${Date.now()}`,
+          type: 'ORDER_CREATED',
+          message: `${order.code} submitted by ${actingUser.name}.`,
+          createdAt: new Date().toISOString(),
+          actorId: actingUser.id
+        });
+        state.ui.customer.showReview = false;
+        state.ui.customer.reviewConsent = false;
+        cart.items = [];
+        cart.tableId = null;
+        cart.schedule = { date: '', time: '' };
+        return state;
+      });
+      alert('Order submitted! Track progress in Orders & Status.');
+      break;
+    }
+    case 'reorder': {
+      const orderId = actionEl.dataset.id;
+      const actingUser = getCurrentUser(store.state);
+      if (!actingUser) {
+        showAuthPrompt('Sign in to reorder your previous meals.', 'login');
+        return;
+      }
+      store.setState((state) => {
+        const cart = ensureCart(state, actingUser.id);
+        const order = state.orders.find((candidate) => candidate.id === orderId);
+        if (order) {
+          cart.items = order.items.map((item) => ({ ...item }));
+          cart.orderType = order.type;
+          cart.tableId = order.tableId;
+          cart.schedule = order.schedule ? { ...order.schedule } : { date: '', time: '' };
+          cart.delivery = order.deliveryAddress ? { ...order.deliveryAddress } : { recipient: '', phone: '', line1: '', neighborhood: '', notes: '' };
+          state.ui.customer.section = 'ordering';
+        }
+        return state;
+      });
+      break;
+    }
+    case 'cancel-reservation': {
+      const reservationId = actionEl.dataset.id;
+      if (!getCurrentUser(store.state)) {
+        showAuthPrompt('Sign in to manage your reservations.', 'login');
+        return;
+      }
+      store.setState((state) => {
+        const reservation = state.reservations.find((candidate) => candidate.id === reservationId);
+        if (reservation) {
+          reservation.status = 'CANCELLED';
+        }
+        return state;
+      });
+      break;
+    }
+    case 'delete-address': {
+      const id = actionEl.dataset.id;
+      if (!getCurrentUser(store.state)) {
+        showAuthPrompt('Sign in to manage saved addresses.', 'login');
+        return;
+      }
+      store.setState((state) => {
+        const user = getCurrentUser(state);
+        user.savedAddresses = (user.savedAddresses || []).filter((address) => address.id !== id);
+        return state;
+      });
+      break;
+    }
+    case 'select-order': {
+      const orderId = actionEl.dataset.id;
+      store.setState((state) => {
+        state.ui.manager.selectedOrderId = orderId;
+        return state;
+      });
+      break;
+    }
+    case 'advance-status': {
+      const orderId = actionEl.dataset.id;
+      store.setState((state) => {
+        const order = state.orders.find((candidate) => candidate.id === orderId);
+        if (!order) return state;
+        const transitions = {
+          RECEIVED: 'IN_PREP',
+          IN_PREP: 'READY',
+          READY: order.type === 'DELIVERY' ? 'READY' : 'COMPLETED'
+        };
+        const next = transitions[order.status];
+        if (next && !(order.type === 'DELIVERY' && order.status === 'READY')) {
+          order.status = next;
+          order.timeline.push({ status: next, note: `Status set to ${next} by manager.`, at: new Date().toISOString() });
+          state.logs.push({
+            id: `log${Date.now()}`,
+            type: 'ORDER_STATUS',
+            message: `Order ${order.code} advanced to ${next}.`,
+            createdAt: new Date().toISOString(),
+            actorId: getCurrentUser(state)?.id
+          });
+        }
+        return state;
+      });
+      break;
+    }
+    case 'cancel-order': {
+      const orderId = actionEl.dataset.id;
+      store.setState((state) => {
+        const order = state.orders.find((candidate) => candidate.id === orderId);
+        if (order) {
+          order.status = 'CANCELLED';
+          order.timeline.push({ status: 'CANCELLED', note: 'Order cancelled by manager.', at: new Date().toISOString() });
+        }
+        return state;
+      });
+      break;
+    }
+    case 'open-assign-driver': {
+      const orderId = actionEl.dataset.id;
+      store.setState((state) => {
+        state.ui.manager.section = 'deliveries';
+        state.ui.manager.selectedOrderId = orderId;
+        return state;
+      });
+      break;
+    }
+    case 'assign-driver': {
+      const orderId = actionEl.dataset.id;
+      store.setState((state) => {
+        const order = state.orders.find((candidate) => candidate.id === orderId);
+        if (!order) return state;
+        const restaurant = state.restaurants.find((rest) => rest.id === order.restaurantId);
+        const drivers = state.staff.filter((staff) => staff.restaurantId === restaurant.id && staff.role.toLowerCase() === 'driver');
+        const available = drivers.find((driver) => state.driverStatus[driver.userId]?.available);
+        const target = available || drivers[0];
+        if (!target) {
+          alert('No drivers available. Add drivers under Staff & shifts.');
+          return state;
+        }
+        const delivery = state.deliveries.find((candidate) => candidate.orderId === orderId);
+        const now = new Date().toISOString();
+        if (delivery) {
+          delivery.driverId = target.userId;
+          delivery.status = 'ASSIGNED';
+          delivery.history.push({ status: 'ASSIGNED', note: 'Reassigned by manager.', at: now });
+        } else {
+          state.deliveries.push({
+            id: `delivery${Date.now()}`,
+            orderId,
+            driverId: target.userId,
+            status: 'ASSIGNED',
+            history: [{ status: 'ASSIGNED', note: 'Assigned by manager.', at: now }],
+            accepted: null
+          });
+        }
+        state.logs.push({
+          id: `log${Date.now()}`,
+          type: 'DELIVERY_ASSIGN',
+          message: `Order ${order.code} assigned to driver ${state.users.find((u) => u.id === target.userId)?.name || target.userId}.`,
+          createdAt: now,
+          actorId: getCurrentUser(state)?.id
+        });
+        return state;
+      });
+      break;
+    }
+    case 'select-table': {
+      const tableId = actionEl.dataset.id;
+      store.setState((state) => {
+        state.ui.manager.selectedTableId = tableId;
+        return state;
+      });
+      break;
+    }
+    case 'set-table-state': {
+      const tableId = actionEl.dataset.id;
+      const newState = actionEl.dataset.state;
+      store.setState((state) => {
+        const table = state.tables.find((candidate) => candidate.id === tableId);
+        if (table) {
+          table.state = newState;
+        }
+        return state;
+      });
+      break;
+    }
+    case 'select-reservation': {
+      const reservationId = actionEl.dataset.id;
+      store.setState((state) => {
+        state.ui.manager.selectedReservationId = reservationId;
+        return state;
+      });
+      break;
+    }
+    case 'confirm-reservation': {
+      const reservationId = actionEl.dataset.id;
+      store.setState((state) => {
+        const reservation = state.reservations.find((candidate) => candidate.id === reservationId);
+        if (reservation) {
+          reservation.status = 'CONFIRMED';
+        }
+        return state;
+      });
+      break;
+    }
+    case 'cancel-reservation-manager': {
+      const reservationId = actionEl.dataset.id;
+      store.setState((state) => {
+        const reservation = state.reservations.find((candidate) => candidate.id === reservationId);
+        if (reservation) {
+          reservation.status = 'CANCELLED';
+        }
+        return state;
+      });
+      break;
+    }
+    case 'delete-menu-item': {
+      const itemId = actionEl.dataset.id;
+      store.setState((state) => {
+        state.menuItems = state.menuItems.filter((item) => item.id !== itemId);
+        return state;
+      });
+      break;
+    }
+    case 'toggle-staff': {
+      const staffId = actionEl.dataset.id;
+      store.setState((state) => {
+        const staff = state.staff.find((candidate) => candidate.id === staffId);
+        if (staff) {
+          staff.status = staff.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
+        }
+        return state;
+      });
+      break;
+    }
+    case 'remove-staff': {
+      const staffId = actionEl.dataset.id;
+      store.setState((state) => {
+        state.staff = state.staff.filter((staff) => staff.id !== staffId);
+        return state;
+      });
+      break;
+    }
+    case 'toggle-availability': {
+      store.setState((state) => {
+        const user = getCurrentUser(state);
+        const status = state.driverStatus[user.id] || { available: false };
+        status.available = !status.available;
+        state.driverStatus[user.id] = status;
+        return state;
+      });
+      break;
+    }
+    case 'select-delivery': {
+      const id = actionEl.dataset.id;
+      store.setState((state) => {
+        state.ui.driver.selectedDeliveryId = id;
+        return state;
+      });
+      break;
+    }
+    case 'accept-delivery':
+    case 'decline-delivery': {
+      const id = actionEl.dataset.id;
+      const accepted = action === 'accept-delivery';
+      store.setState((state) => {
+        const delivery = state.deliveries.find((candidate) => candidate.id === id);
+        if (delivery) {
+          delivery.accepted = accepted;
+          delivery.history.push({ status: accepted ? 'ACCEPTED' : 'DECLINED', note: `Driver ${accepted ? 'accepted' : 'declined'} assignment.`, at: new Date().toISOString() });
+        }
+        return state;
+      });
+      break;
+    }
+    case 'mark-delivery': {
+      const id = actionEl.dataset.id;
+      const status = actionEl.dataset.status;
+      store.setState((state) => {
+        const delivery = state.deliveries.find((candidate) => candidate.id === id);
+        if (!delivery) return state;
+        const order = state.orders.find((candidate) => candidate.id === delivery.orderId);
+        if (!order) return state;
+        delivery.status = status;
+        delivery.history.push({ status, at: new Date().toISOString(), note: `Driver marked ${status}.` });
+        order.status = status;
+        order.timeline.push({ status, note: `Driver updated status to ${status}.`, at: new Date().toISOString() });
+        return state;
+      });
+      break;
+    }
+    case 'change-role': {
+      const userId = actionEl.dataset.id;
+      const role = prompt('Enter new role (customer, manager, driver, server, admin):');
+      if (!role) return;
+      store.setState((state) => {
+        const target = state.users.find((candidate) => candidate.id === userId);
+        if (target) {
+          target.role = role.toLowerCase();
+        }
+        return state;
+      });
+      break;
+    }
+    case 'remove-user': {
+      const userId = actionEl.dataset.id;
+      store.setState((state) => {
+        state.users = state.users.filter((candidate) => candidate.id !== userId);
+        state.staff = state.staff.filter((staff) => staff.userId !== userId);
+        return state;
+      });
+      break;
+    }
+    case 'select-restaurant': {
+      const id = actionEl.dataset.id;
+      store.setState((state) => {
+        state.ui.admin.selectedRestaurantId = id;
+        return state;
+      });
+      break;
+    }
+    case 'toggle-restaurant': {
+      const id = actionEl.dataset.id;
+      store.setState((state) => {
+        const restaurant = state.restaurants.find((candidate) => candidate.id === id);
+        if (restaurant) {
+          restaurant.status = restaurant.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
+        }
+        return state;
+      });
+      break;
+    }
+    case 'export-csv': {
+      alert('CSV export is simulated in this prototype.');
+      break;
+    }
+    default:
+      break;
+  }
+});
+
+document.addEventListener('input', (event) => {
+  const field = event.target.dataset.field;
+  if (!field) return;
+  const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
+  updateFieldValue(field, value);
+});
+
+document.addEventListener('change', (event) => {
+  const field = event.target.dataset.field;
+  if (!field) return;
+  const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
+  updateFieldValue(field, value);
+});
+
+document.addEventListener('submit', (event) => {
+  const form = event.target;
+  const type = form.dataset.form;
+  if (!type) return;
+  event.preventDefault();
+
+  const formData = new FormData(form);
+
+  switch (type) {
+    case 'login': {
+      const email = formData.get('email');
+      const password = formData.get('password');
+      const user = store.state.users.find((candidate) => candidate.email === email && candidate.password === password);
+      if (!user) {
+        alert('Invalid credentials. Use demo accounts like avery@servesoft.app / demo123!');
+        return;
+      }
+      store.setState((state) => {
+        state.currentUserId = user.id;
+        state.ui.authVisible = false;
+        state.ui.authMessage = '';
+        return state;
+      });
+      break;
+    }
+    case 'signup': {
+      const name = formData.get('name');
+      const phone = formData.get('phone');
+      const email = formData.get('email');
+      const password = formData.get('password');
+      const confirm = formData.get('confirm');
+      if (password !== confirm) {
+        alert('Passwords do not match.');
+        return;
+      }
+      store.setState((state) => {
+        const id = `u${Date.now()}`;
+        state.users.push({
+          id,
+          role: 'customer',
+          name,
+          phone,
+          email,
+          password,
+          savedAddresses: [],
+          preferences: { defaultType: 'DELIVERY' }
+        });
+        state.currentUserId = id;
+        state.ui.authVisible = false;
+        state.ui.authMessage = '';
+        return state;
+      });
+      break;
+    }
+    case 'entry-context': {
+      store.setState((state) => {
+        const user = getActingCustomer(state);
+        const cart = ensureCart(state, user.id);
+        cart.restaurantId = formData.get('restaurantId');
+        cart.orderType = formData.get('intent');
+        cart.tableId = formData.get('tableId') || null;
+        cart.schedule = { date: formData.get('date') || '', time: formData.get('time') || '' };
+        cart.delivery = {
+          recipient: formData.get('recipient') || '',
+          phone: formData.get('phone') || '',
+          line1: formData.get('line1') || '',
+          neighborhood: formData.get('neighborhood') || '',
+          notes: formData.get('notes') || ''
+        };
+        return state;
+      });
+      break;
+    }
+    case 'customize-item': {
+      const itemId = form.dataset.item;
+      const actingUser = getCurrentUser(store.state);
+      if (!actingUser) {
+        showAuthPrompt('Sign in to add items to your cart. Your selections will be ready once you return.', 'login');
+        return;
+      }
+      const quantity = Number(formData.get('quantity')) || 1;
+      const notes = formData.get('notes') || '';
+      const modifiers = formData.getAll('modifiers');
+      store.setState((state) => {
+        const cart = ensureCart(state, actingUser.id);
+        const item = state.menuItems.find((candidate) => candidate.id === itemId);
+        if (!item) return state;
+        const existing = cart.items.find((entry) => entry.menuId === itemId);
+        if (existing) {
+          existing.quantity = quantity;
+          existing.notes = notes;
+          existing.modifiers = modifiers;
+        } else {
+          cart.items.push({
+            menuId: item.id,
+            name: item.name,
+            price: item.price,
+            quantity,
+            modifiers,
+            notes
+          });
+        }
+        state.ui.customer.selectedItemId = null;
+        return state;
+      });
+      break;
+    }
+    case 'create-reservation': {
+      const date = formData.get('date');
+      const time = formData.get('time');
+      const partySize = Number(formData.get('partySize'));
+      const notes = formData.get('notes');
+      const actingUser = getCurrentUser(store.state);
+      if (!actingUser) {
+        showAuthPrompt('Sign in to request a reservation.', 'login');
+        return;
+      }
+      store.setState((state) => {
+        state.reservations.push({
+          id: `res${Date.now()}`,
+          restaurantId: ensureCart(state, actingUser.id).restaurantId,
+          customerId: actingUser.id,
+          tableId: null,
+          date,
+          time,
+          partySize,
+          notes,
+          status: 'REQUESTED'
+        });
+        return state;
+      });
+      break;
+    }
+    case 'update-profile': {
+      const name = formData.get('name');
+      const phone = formData.get('phone');
+      if (!getCurrentUser(store.state)) {
+        showAuthPrompt('Sign in to update your profile.', 'login');
+        return;
+      }
+      store.setState((state) => {
+        const user = getCurrentUser(state);
+        user.name = name;
+        user.phone = phone;
+        return state;
+      });
+      break;
+    }
+    case 'add-address': {
+      if (!getCurrentUser(store.state)) {
+        showAuthPrompt('Sign in to save delivery addresses.', 'login');
+        return;
+      }
+      store.setState((state) => {
+        const user = getCurrentUser(state);
+        const address = {
+          id: `addr${Date.now()}`,
+          label: formData.get('label'),
+          recipient: formData.get('recipient'),
+          phone: formData.get('phone'),
+          neighborhood: formData.get('neighborhood'),
+          line1: formData.get('line1'),
+          notes: formData.get('notes')
+        };
+        user.savedAddresses = user.savedAddresses || [];
+        user.savedAddresses.push(address);
+        return state;
+      });
+      break;
+    }
+    case 'send-feedback': {
+      const message = formData.get('message');
+      store.setState((state) => {
+        state.feedback.push({ id: `feedback${Date.now()}`, message, userId: getCurrentUser(state)?.id, createdAt: new Date().toISOString() });
+        return state;
+      });
+      alert('Thanks for the feedback!');
+      form.reset();
+      break;
+    }
+    case 'manager-reservation': {
+      const email = formData.get('email');
+      const date = formData.get('date');
+      const time = formData.get('time');
+      const partySize = Number(formData.get('partySize'));
+      const notes = formData.get('notes');
+      store.setState((state) => {
+        const customer = state.users.find((user) => user.email === email);
+        const staffRecord = state.staff.find((staff) => staff.userId === getCurrentUser(state)?.id);
+        state.reservations.push({
+          id: `res${Date.now()}`,
+          restaurantId: staffRecord?.restaurantId || 'r1',
+          customerId: customer?.id || null,
+          tableId: null,
+          date,
+          time,
+          partySize,
+          notes,
+          status: 'PENDING'
+        });
+        return state;
+      });
+      break;
+    }
+    case 'seat-reservation': {
+      const reservationId = form.dataset.id;
+      const tableId = formData.get('tableId');
+      store.setState((state) => {
+        const reservation = state.reservations.find((candidate) => candidate.id === reservationId);
+        if (reservation) {
+          reservation.tableId = tableId;
+          reservation.status = 'SEATED';
+          const table = state.tables.find((candidate) => candidate.id === tableId);
+          if (table) table.state = 'SEATED';
+        }
+        return state;
+      });
+      break;
+    }
+    case 'add-menu-item': {
+      const name = formData.get('name');
+      const category = formData.get('category');
+      const price = Number(formData.get('price'));
+      const available = formData.get('available') === 'true';
+      const description = formData.get('description');
+      const modifiers = formData.get('modifiers');
+      store.setState((state) => {
+        const restaurant = getManagerRestaurant(state, getCurrentUser(state));
+        state.menuItems.push({
+          id: `m${Date.now()}`,
+          restaurantId: restaurant?.id || 'r1',
+          category,
+          name,
+          price,
+          description,
+          available,
+          modifiers: modifiers ? modifiers.split(',').map((item) => item.trim()).filter(Boolean) : []
+        });
+        return state;
+      });
+      form.reset();
+      break;
+    }
+    case 'add-staff': {
+      const name = formData.get('name');
+      const email = formData.get('email');
+      const role = formData.get('role');
+      const phone = formData.get('phone');
+      const password = formData.get('password');
+      store.setState((state) => {
+        const restaurant = getManagerRestaurant(state, getCurrentUser(state));
+        const id = `u${Date.now()}`;
+        state.users.push({ id, role, name, email, phone, password });
+        state.staff.push({ id: `staff${Date.now()}`, userId: id, restaurantId: restaurant?.id || 'r1', role: role.charAt(0).toUpperCase() + role.slice(1), status: 'ACTIVE' });
+        if (role === 'driver') {
+          state.driverStatus[id] = { available: false, activeDeliveries: [] };
+        }
+        return state;
+      });
+      alert('Staff registered. Share the temporary password for first login.');
+      break;
+    }
+    case 'add-shift': {
+      const staffId = formData.get('staffId');
+      const date = formData.get('date');
+      const start = formData.get('start');
+      const end = formData.get('end');
+      const notes = formData.get('notes');
+      store.setState((state) => {
+        const restaurant = getManagerRestaurant(state, getCurrentUser(state));
+        state.shifts.push({ id: `shift${Date.now()}`, staffId, restaurantId: restaurant?.id || 'r1', date, start, end, notes });
+        return state;
+      });
+      break;
+    }
+    case 'create-announcement': {
+      const title = formData.get('title');
+      const scope = formData.get('scope');
+      const body = formData.get('body');
+      const target = formData.get('target');
+      store.setState((state) => {
+        const restaurant = getManagerRestaurant(state, getCurrentUser(state));
+        state.announcements.push({
+          id: `msg${Date.now()}`,
+          restaurantId: restaurant?.id || null,
+          scope,
+          title,
+          body,
+          targetEmail: target,
+          createdAt: new Date().toISOString(),
+          createdBy: getCurrentUser(state)?.id
+        });
+        return state;
+      });
+      break;
+    }
+    case 'update-settings': {
+      const name = formData.get('name');
+      const phone = formData.get('phone');
+      const zones = formData.get('zones');
+      const lead = Number(formData.get('lead'));
+      store.setState((state) => {
+        const restaurant = getManagerRestaurant(state, getCurrentUser(state));
+        if (restaurant) {
+          restaurant.name = name;
+          restaurant.phone = phone;
+          restaurant.serviceRules.deliveryZones = zones.split(',').map((item) => item.trim()).filter(Boolean);
+          restaurant.serviceRules.preorderLeadMinutes = lead;
+        }
+        return state;
+      });
+      break;
+    }
+    case 'add-restaurant': {
+      const name = formData.get('name');
+      const location = formData.get('location');
+      const phone = formData.get('phone');
+      store.setState((state) => {
+        state.restaurants.push({
+          id: `r${Date.now()}`,
+          name,
+          location,
+          phone,
+          status: 'ACTIVE',
+          address: location,
+          hours: seedState().restaurants[0].hours,
+          serviceRules: {
+            deliveryZones: ['Central'],
+            preorderLeadMinutes: 60,
+            tableQrPrefix: 'https://servesoft.app/entry'
+          }
+        });
+        return state;
+      });
+      break;
+    }
+    default:
+      break;
+  }
+});
+```
+
+## config.php
+
+```php
+<?php
+mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
+$servername = "localhost";
+$username = "root";
+$password = "";
+$database = "SERVESOFT";
+
+$conn = new mysqli($servername, $username, $password, $database);
+$conn->set_charset('utf8mb4');
+?>
+```
+
+## bootstrap.php
+
+```php
+<?php
+require 'config.php';
+
+header('Content-Type: application/json');
+
+$response = [
+    'restaurants' => [],
+    'tables' => [],
+    'menuItems' => []
+];
+
+try {
+    $restaurantQuery = $conn->query('SELECT RestaurantID, RestaurantName, Status, Location, PhoneNumber, Address FROM Restaurant');
+    while ($row = $restaurantQuery->fetch_assoc()) {
+        $response['restaurants'][] = [
+            'id' => 'r' . $row['RestaurantID'],
+            'name' => $row['RestaurantName'],
+            'status' => $row['Status'] ?? 'ACTIVE',
+            'location' => $row['Location'] ?? '',
+            'phone' => $row['PhoneNumber'] ?? '',
+            'address' => $row['Address'] ?? '',
+            'hours' => null,
+            'serviceRules' => null
+        ];
+    }
+    $restaurantQuery->close();
+
+    $tableQuery = $conn->query('SELECT TableID, RestaurantID, TableNumber, Capacity, Status FROM RestaurantTable');
+    while ($row = $tableQuery->fetch_assoc()) {
+        $response['tables'][] = [
+            'id' => 't' . $row['TableID'],
+            'restaurantId' => 'r' . $row['RestaurantID'],
+            'label' => 'Table ' . $row['TableNumber'],
+            'capacity' => (int) $row['Capacity'],
+            'state' => $row['Status'] ?? 'FREE'
+        ];
+    }
+    $tableQuery->close();
+
+    $menuQuery = $conn->query('SELECT MenuID, RestaurantID, ItemName, ItemDescription, Category, Availability, Price FROM MenuItem');
+    while ($row = $menuQuery->fetch_assoc()) {
+        $response['menuItems'][] = [
+            'id' => 'm' . $row['MenuID'],
+            'restaurantId' => 'r' . $row['RestaurantID'],
+            'name' => $row['ItemName'],
+            'description' => $row['ItemDescription'] ?? '',
+            'category' => $row['Category'] ?? 'General',
+            'available' => (bool) $row['Availability'],
+            'price' => (float) $row['Price'],
+            'modifiers' => []
+        ];
+    }
+    $menuQuery->close();
+
+    echo json_encode($response);
+} catch (Throwable $error) {
+    http_response_code(500);
+    echo json_encode([
+        'error' => 'Failed to read SERVESOFT data',
+        'details' => $error->getMessage()
+    ]);
+}
+```
+
+## auth.php
+
+```php
+<?php
+session_start();
+require 'config.php';
+
+$error = '';
+
+if ($_SERVER['REQUEST_METHOD'] === 'POST') {
+    $email = trim($_POST['email'] ?? '');
+    $password = $_POST['password'] ?? '';
+
+    if ($email === '' || $password === '') {
+        $error = 'Please provide both email and password.';
+    } else {
+        $sql = "SELECT a.AccountID, a.UserID, a.Password, u.Name, u.Email, u.PhoneNumber
+                FROM Account a
+                INNER JOIN User u ON u.UserID = a.UserID
+                WHERE u.Email = ?";
+        $stmt = $conn->prepare($sql);
+
+        if ($stmt) {
+            $stmt->bind_param('s', $email);
+            $stmt->execute();
+            $result = $stmt->get_result();
+            $account = $result->fetch_assoc();
+            $stmt->close();
+
+            if ($account && password_verify($password, $account['Password'])) {
+                $_SESSION['user_id'] = $account['UserID'];
+                $_SESSION['account_id'] = $account['AccountID'];
+                $_SESSION['name'] = $account['Name'];
+                $_SESSION['email'] = $account['Email'];
+                $_SESSION['phone'] = $account['PhoneNumber'];
+
+                header('Location: hello.php');
+                exit;
+            }
+        }
+
+        if ($error === '') {
+            $error = 'Invalid login credentials. Please try again.';
+        }
+    }
+}
+?>
+<!DOCTYPE html>
+<html lang="en">
+<head>
+  <meta charset="UTF-8">
+  <meta name="viewport" content="width=device-width, initial-scale=1.0">
+  <title>Servesoft Login</title>
+  <link rel="stylesheet" href="styles.css">
+</head>
+<body>
+  <section class="auth-shell">
+    <article class="card">
+      <header>
+        <h1>Welcome Back</h1>
+        <p>Sign in with your Servesoft email to continue.</p>
+      </header>
+      <?php if ($error): ?>
+        <div class="alert error"><?= htmlspecialchars($error) ?></div>
+      <?php endif; ?>
+      <form method="post" novalidate>
+        <label for="email">
+          Email
+          <input type="email" id="email" name="email" placeholder="you@example.com" value="<?= htmlspecialchars($_POST['email'] ?? '') ?>" required>
+        </label>
+        <label for="password">
+          Password
+          <input type="password" id="password" name="password" placeholder="••••••••" required>
+        </label>
+        <div class="actions">
+          <button class="primary" type="submit">Login</button>
+          <a href="register.php"><button class="secondary" type="button">Need an account?</button></a>
+        </div>
+      </form>
+      <p class="helper-text">
+        Having trouble? Contact your Servesoft administrator for assistance.
+      </p>
+    </article>
+  </section>
+</body>
+</html>
+```
+
+## register.php
+
+```php
+<?php
+session_start();
+require 'config.php';
+
+$error = '';
+$success = '';
+
+if ($_SERVER['REQUEST_METHOD'] === 'POST') {
+    $name = trim($_POST['name'] ?? '');
+    $phone = trim($_POST['phone'] ?? '');
+    $email = trim($_POST['email'] ?? '');
+    $password = $_POST['password'] ?? '';
+    $confirm = $_POST['confirm_password'] ?? '';
+
+    if ($name === '' || $email === '' || $password === '' || $confirm === '') {
+        $error = 'All required fields must be completed.';
+    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
+        $error = 'Please provide a valid email address.';
+    } elseif ($password !== $confirm) {
+        $error = 'Passwords do not match.';
+    } elseif (strlen($password) < 8 ||
+        !preg_match('/[A-Z]/', $password) ||
+        !preg_match('/[a-z]/', $password) ||
+        !preg_match('/\d/', $password) ||
+        !preg_match('/[^A-Za-z0-9]/', $password)) {
+        $error = 'Password must be at least 8 characters and include uppercase, lowercase, number, and symbol.';
+    } else {
+        $conn->begin_transaction();
+        try {
+            $stmt = $conn->prepare('INSERT INTO User (Name, PhoneNumber, Email) VALUES (?, ?, ?)');
+            $stmt->bind_param('sss', $name, $phone, $email);
+            $stmt->execute();
+            $userId = $stmt->insert_id;
+            $stmt->close();
+
+            $hashed = password_hash($password, PASSWORD_DEFAULT);
+            $stmt = $conn->prepare('INSERT INTO Account (UserID, PhoneNumber, Password) VALUES (?, ?, ?)');
+            $stmt->bind_param('iss', $userId, $phone, $hashed);
+            $stmt->execute();
+            $stmt->close();
+
+            $stmt = $conn->prepare('INSERT INTO Customer (UserID) VALUES (?)');
+            $stmt->bind_param('i', $userId);
+            $stmt->execute();
+            $stmt->close();
+
+            $conn->commit();
+            $success = 'Account created! You can now sign in.';
+        } catch (mysqli_sql_exception $e) {
+            $conn->rollback();
+            if ($e->getCode() === 1062) {
+                $error = 'An account with that email already exists.';
+            } else {
+                $error = 'Registration failed. Please try again.';
+            }
+        }
+    }
+}
+?>
+<!DOCTYPE html>
+<html lang="en">
+<head>
+  <meta charset="UTF-8">
+  <meta name="viewport" content="width=device-width, initial-scale=1.0">
+  <title>Create Servesoft Account</title>
+  <link rel="stylesheet" href="styles.css">
+</head>
+<body>
+  <section class="auth-shell">
+    <article class="card">
+      <header>
+        <h1>Create Your Account</h1>
+        <p>Join Servesoft to manage your reservations and orders.</p>
+      </header>
+      <?php if ($error): ?>
+        <div class="alert error"><?= htmlspecialchars($error) ?></div>
+      <?php elseif ($success): ?>
+        <div class="alert success"><?= htmlspecialchars($success) ?></div>
+      <?php endif; ?>
+      <form method="post" novalidate>
+        <label for="name">
+          Full Name
+          <input type="text" id="name" name="name" placeholder="Jane Doe" value="<?= htmlspecialchars($_POST['name'] ?? '') ?>" required>
+        </label>
+        <label for="phone">
+          Phone Number
+          <input type="tel" id="phone" name="phone" placeholder="Optional" value="<?= htmlspecialchars($_POST['phone'] ?? '') ?>">
+        </label>
+        <label for="email">
+          Email
+          <input type="email" id="email" name="email" placeholder="you@example.com" value="<?= htmlspecialchars($_POST['email'] ?? '') ?>" required>
+        </label>
+        <label for="password">
+          Password
+          <input type="password" id="password" name="password" placeholder="Create a strong password" required>
+        </label>
+        <label for="confirm_password">
+          Confirm Password
+          <input type="password" id="confirm_password" name="confirm_password" placeholder="Repeat your password" required>
+        </label>
+        <div class="actions">
+          <button class="secondary" type="submit">Register</button>
+          <a href="auth.php"><button class="primary" type="button">Back to login</button></a>
+        </div>
+      </form>
+      <p class="helper-text">Passwords require 8+ characters with uppercase, lowercase, number, and symbol.</p>
+    </article>
+  </section>
+</body>
+</html>
+```
+
+## hello.php
+
+```php
+<?php
+session_start();
+require 'config.php';
+
+if (!isset($_SESSION['user_id'])) {
+    header('Location: auth.php');
+    exit;
+}
+
+$userId = $_SESSION['user_id'];
+
+$summary = [
+    'reservations' => 0,
+    'orders' => 0,
+    'deliveries' => 0,
+];
+
+try {
+    $stmt = $conn->prepare('SELECT COUNT(*) AS total FROM Reservation WHERE CustomerID = (SELECT CustomerID FROM Customer WHERE UserID = ?)');
+    $stmt->bind_param('i', $userId);
+    $stmt->execute();
+    $result = $stmt->get_result()->fetch_assoc();
+    $summary['reservations'] = (int)($result['total'] ?? 0);
+    $stmt->close();
+
+    $stmt = $conn->prepare('SELECT COUNT(*) AS total FROM CustomerOrder WHERE CustomerID = (SELECT CustomerID FROM Customer WHERE UserID = ?)');
+    $stmt->bind_param('i', $userId);
+    $stmt->execute();
+    $result = $stmt->get_result()->fetch_assoc();
+    $summary['orders'] = (int)($result['total'] ?? 0);
+    $stmt->close();
+
+    $stmt = $conn->prepare('SELECT COUNT(*) AS total FROM Delivery d INNER JOIN CustomerOrder o ON d.OrderID = o.OrderID WHERE o.CustomerID = (SELECT CustomerID FROM Customer WHERE UserID = ?)');
+    $stmt->bind_param('i', $userId);
+    $stmt->execute();
+    $result = $stmt->get_result()->fetch_assoc();
+    $summary['deliveries'] = (int)($result['total'] ?? 0);
+    $stmt->close();
+} catch (mysqli_sql_exception $e) {
+    // Keep dashboard available even if optional tables are empty/missing
+}
+?>
+<!DOCTYPE html>
+<html lang="en">
+<head>
+  <meta charset="UTF-8">
+  <meta name="viewport" content="width=device-width, initial-scale=1.0">
+  <title>Servesoft Dashboard</title>
+  <link rel="stylesheet" href="styles.css">
+</head>
+<body>
+  <section class="dashboard-shell">
+    <article class="card">
+      <header>
+        <h1>Hi <?= htmlspecialchars($_SESSION['name'] ?? 'Servesoft User') ?>!</h1>
+        <p>Here is a quick snapshot of your Servesoft activity.</p>
+      </header>
+      <section class="summary">
+        <div class="summary-row">
+          <div class="summary-pill">
+            <h3>Reservations</h3>
+            <p><?= $summary['reservations'] ?></p>
+          </div>
+          <div class="summary-pill">
+            <h3>Orders</h3>
+            <p><?= $summary['orders'] ?></p>
+          </div>
+          <div class="summary-pill">
+            <h3>Deliveries</h3>
+            <p><?= $summary['deliveries'] ?></p>
+          </div>
+        </div>
+      </section>
+      <section class="summary">
+        <h2>Your Profile</h2>
+        <p><strong>Email:</strong> <?= htmlspecialchars($_SESSION['email'] ?? '') ?></p>
+        <p><strong>Phone:</strong> <?= htmlspecialchars($_SESSION['phone'] ?? 'Not provided') ?></p>
+      </section>
+      <div class="actions">
+        <form action="logout.php" method="post">
+          <button class="secondary" type="submit" name="logout" value="1">Logout</button>
+        </form>
+      </div>
+    </article>
+  </section>
+</body>
+</html>
+```
+
+## logout.php
+
+```php
+<?php
+session_start();
+
+if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['logout'])) {
+    session_unset();
+    session_destroy();
+    header('Location: auth.php');
+    exit;
+}
+
+header('Location: hello.php');
+exit;
+?>
+```
+
+## views.php
+
+```php
+<?php
+require 'config.php';
+
+$tables = [];
+$result = $conn->query('SHOW TABLES');
+while ($row = $result->fetch_array(MYSQLI_NUM)) {
+    $tables[] = $row[0];
+}
+$result->close();
+?>
+<!DOCTYPE html>
+<html lang="en">
+<head>
+  <meta charset="UTF-8">
+  <meta name="viewport" content="width=device-width, initial-scale=1.0">
+  <title>SERVESOFT Schema Overview</title>
+  <link rel="stylesheet" href="styles.css">
+</head>
+<body>
+  <section class="auth-shell">
+    <article class="card">
+      <header>
+        <h1>SERVESOFT Database</h1>
+        <p>Schema and snapshot of stored data.</p>
+      </header>
+      <?php foreach ($tables as $table): ?>
+        <section class="summary">
+          <h2><?= htmlspecialchars($table) ?></h2>
+          <div class="table-wrapper">
+            <table>
+              <thead>
+                <tr>
+                  <th>Column</th>
+                  <th>Type</th>
+                </tr>
+              </thead>
+              <tbody>
+                <?php
+                  $describe = $conn->query("DESCRIBE `$table`");
+                  while ($column = $describe->fetch_assoc()):
+                ?>
+                  <tr>
+                    <td><?= htmlspecialchars($column['Field']) ?></td>
+                    <td><?= htmlspecialchars($column['Type']) ?></td>
+                  </tr>
+                <?php endwhile; ?>
+              </tbody>
+            </table>
+          </div>
+          <div class="table-wrapper">
+            <table>
+              <thead>
+                <tr>
+                  <?php
+                    $columns = [];
+                    $fields = $conn->query("SHOW COLUMNS FROM `$table`");
+                    while ($field = $fields->fetch_assoc()) {
+                        $columns[] = $field['Field'];
+                        echo '<th>' . htmlspecialchars($field['Field']) . '</th>';
+                    }
+                  ?>
+                </tr>
+              </thead>
+              <tbody>
+                <?php
+                  $rows = $conn->query("SELECT * FROM `$table`");
+                  if ($rows->num_rows === 0):
+                ?>
+                  <tr>
+                    <td colspan="<?= count($columns) ?>">No data recorded yet.</td>
+                  </tr>
+                <?php else:
+                    while ($data = $rows->fetch_assoc()): ?>
+                  <tr>
+                    <?php foreach ($columns as $columnName): ?>
+                      <td><?= htmlspecialchars((string)($data[$columnName] ?? '')) ?></td>
+                    <?php endforeach; ?>
+                  </tr>
+                <?php endwhile;
+                  endif; ?>
+              </tbody>
+            </table>
+          </div>
+        </section>
+      <?php endforeach; ?>
+      <footer>
+        Connected to SERVESOFT database using mysqli.
+      </footer>
+    </article>
+  </section>
+</body>
+</html>
+```
