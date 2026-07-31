export type MockStore = {
  id: string
  slug: string
  name: string
  category: string
  rating: number
  emoji: string
  color: string
  distance: string
  hours: string
  productsCount: number
}

export type MockProduct = {
  id: string
  name: string
  price: number
  category: string
  storeId: string
  storeName: string
  emoji: string
  color: string
}

export type MockUserProduct = {
  id: string
  name: string
  price: number
  oldPrice?: number
  stock: number
  storeId: string
  storeName: string
  category: string
  image: string
  images: string[]
  description: string
  sales: number
  views: number
  available: boolean
  featured: boolean
}

export type MockPayment = {
  id: string
  date: string
  amount: number
  method: 'transfer' | 'binance' | 'paypal' | 'card'
  status: 'approved' | 'pending' | 'rejected'
  ref: string
}

export type MockCategory = {
  id: string
  name: string
  image: string | null
  icon: string
  active: boolean
  parentId: string | null
  productsCount: number
}

const palette = [
  '#7BD3A8',
  '#F7B267',
  '#F4978E',
  '#A0C4FF',
  '#BDB2FF',
  '#FFC8DD',
  '#90E0EF',
  '#FFD6A5',
]
const emojis = [
  '🛍️',
  '👟',
  '👕',
  '📱',
  '🎧',
  '💄',
  '🍞',
  '☕',
  '🌿',
  '🪴',
  '📚',
  '🍩',
]
const categories = [
  'Moda',
  'Tech',
  'Hogar',
  'Belleza',
  'Comida',
  'Deporte',
  'Libros',
  'Mascotas',
]

export const mockStores: MockStore[] = Array.from({ length: 12 }).map(
  (_, i) => ({
    id: `s${i + 1}`,
    slug: [
      'sportzone',
      'moda-clara',
      'tech-now',
      'cafe-luna',
      'verde-vivo',
      'el-rincon',
      'boutique-sol',
      'fitwear',
      'panaderia-pan',
      'petlove',
      'libreria-azul',
      'beauty-co',
    ][i],
    name: [
      'SportZone',
      'Moda Clara',
      'Tech Now',
      'Café Luna',
      'Verde Vivo',
      'El Rincón',
      'Boutique Sol',
      'FitWear',
      'Panadería Pan',
      'PetLove',
      'Librería Azul',
      'Beauty Co',
    ][i],
    category: categories[i % categories.length],
    rating: 4 + Math.random(),
    emoji: emojis[i % emojis.length],
    color: palette[i % palette.length],
    distance: `${(Math.random() * 5 + 0.2).toFixed(1)} km`,
    hours: '9:00 - 20:00',
    productsCount: 20 + Math.floor(Math.random() * 80),
  }),
)

export const mockProducts: MockProduct[] = Array.from({ length: 60 }).map(
  (_, i) => {
    const store = mockStores[i % mockStores.length]
    return {
      id: `p${i + 1}`,
      name:
        [
          'Camiseta Pro',
          'Zapatillas Run',
          'Mochila Urbana',
          'Auriculares X',
          'Taza Mate',
          'Planta Mini',
          'Crema Glow',
          'Pan Artesanal',
          'Libro Verano',
          'Collar Pet',
          'Reloj Smart',
          'Lámpara Loft',
        ][i % 12] + ` ${i + 1}`,
      price: Math.round((9 + Math.random() * 90) * 100) / 100,
      category: categories[i % categories.length],
      storeId: store.id,
      storeName: store.name,
      emoji: emojis[i % emojis.length],
      color: palette[i % palette.length],
    }
  },
)

export const mockUserProducts: MockUserProduct[] = [
  {
    id: 'up1',
    name: 'Camiseta Pro Verde',
    price: 24.9,
    oldPrice: 32,
    stock: 18,
    storeId: 's1',
    storeName: 'SportZone',
    category: 'Moda',
    image:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&h=600&q=70',
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&h=600&q=70',
    ],
    description:
      'Camiseta técnica de secado rápido, tejido transpirable ideal para entrenar.',
    sales: 128,
    views: 1420,
    available: true,
    featured: true,
  },
  {
    id: 'up2',
    name: 'Zapatillas Run Lite',
    price: 79,
    stock: 6,
    storeId: 's1',
    storeName: 'SportZone',
    category: 'Deporte',
    image:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&h=600&q=70',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&h=600&q=70',
    ],
    description:
      'Zapatillas ligeras con amortiguación reactiva para correr largas distancias.',
    sales: 64,
    views: 980,
    available: true,
    featured: false,
  },
  {
    id: 'up3',
    name: 'Mochila Urbana',
    price: 45.5,
    stock: 0,
    storeId: 's2',
    storeName: 'Moda Clara',
    category: 'Moda',
    image:
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&h=600&q=70',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&h=600&q=70',
    ],
    description:
      'Mochila resistente al agua con compartimento acolchado para laptop 15".',
    sales: 22,
    views: 410,
    available: false,
    featured: false,
  },
  {
    id: 'up4',
    name: 'Auriculares X-200',
    price: 59.9,
    oldPrice: 79,
    stock: 12,
    storeId: 's3',
    storeName: 'Tech Now',
    category: 'Tech',
    image:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&h=600&q=70',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&h=600&q=70',
    ],
    description:
      'Auriculares inalámbricos con cancelación activa de ruido y 30h de batería.',
    sales: 210,
    views: 2560,
    available: true,
    featured: true,
  },
  {
    id: 'up5',
    name: 'Taza Mate Artesanal',
    price: 12,
    stock: 24,
    storeId: 's2',
    storeName: 'Moda Clara',
    category: 'Hogar',
    image:
      'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=600&h=600&q=70',
    images: [
      'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=600&h=600&q=70',
    ],
    description:
      'Taza hecha a mano en cerámica esmaltada, apta para microondas.',
    sales: 45,
    views: 320,
    available: true,
    featured: false,
  },
  {
    id: 'up6',
    name: 'Reloj Smart Mini',
    price: 99,
    stock: 3,
    storeId: 's3',
    storeName: 'Tech Now',
    category: 'Tech',
    image:
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=600&h=600&q=70',
    images: [
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=600&h=600&q=70',
    ],
    description:
      'Smartwatch con GPS, medidor de FC y notificaciones sincronizadas.',
    sales: 88,
    views: 1180,
    available: true,
    featured: false,
  },
]

export const mockPaymentHistory: MockPayment[] = [
  {
    id: 'pay1',
    date: '2025-04-01',
    amount: 19.9,
    method: 'transfer',
    status: 'approved',
    ref: 'TRX-88421',
  },
  {
    id: 'pay2',
    date: '2025-03-01',
    amount: 19.9,
    method: 'binance',
    status: 'approved',
    ref: '0x9af...c12',
  },
  {
    id: 'pay3',
    date: '2025-02-01',
    amount: 19.9,
    method: 'paypal',
    status: 'approved',
    ref: 'PP-77231',
  },
  {
    id: 'pay4',
    date: '2025-01-15',
    amount: 9.9,
    method: 'card',
    status: 'rejected',
    ref: 'CARD-3321',
  },
]

export const defaultWhatsappTemplate =
  '¡Hola {tienda}! 👋\nSoy {cliente} y quiero pedir:\n\n{productos}\n\nTotal: {total}\nFecha: {fecha}\n¡Gracias!'

const catImg = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=600&h=600&q=70`

export const mockCategories: MockCategory[] = [
  {
    id: 'c1',
    name: 'Moda',
    icon: '👕',
    image: catImg('photo-1520006403909-838d6b92c22e'),
    active: true,
    parentId: null,
    productsCount: 24,
  },
  {
    id: 'c2',
    name: 'Camisetas',
    icon: '👕',
    image: catImg('photo-1521572163474-6864f9cf17ab'),
    active: true,
    parentId: 'c1',
    productsCount: 12,
  },
  {
    id: 'c3',
    name: 'Zapatillas',
    icon: '👟',
    image: catImg('photo-1542291026-7eec264c27ff'),
    active: true,
    parentId: 'c1',
    productsCount: 8,
  },
  {
    id: 'c4',
    name: 'Tech',
    icon: '📱',
    image: catImg('photo-1511707171634-5f897ff02aa9'),
    active: true,
    parentId: null,
    productsCount: 18,
  },
  {
    id: 'c5',
    name: 'Audio',
    icon: '🎧',
    image: catImg('photo-1505740420928-5e560c06d30e'),
    active: false,
    parentId: 'c4',
    productsCount: 5,
  },
  {
    id: 'c6',
    name: 'Hogar',
    icon: '🪴',
    image: catImg('photo-1514228742587-6b1558fcca3d'),
    active: true,
    parentId: null,
    productsCount: 10,
  },
  {
    id: 'c7',
    name: 'Belleza',
    icon: '💄',
    image: null,
    active: true,
    parentId: null,
    productsCount: 6,
  },
]

export const mockIncomeSeries = {
  '7d': [120, 180, 90, 220, 160, 280, 210],
  '30d': Array.from({ length: 30 }, (_, i) =>
    Math.round(80 + Math.sin(i / 3) * 60 + Math.random() * 80),
  ),
  '90d': Array.from({ length: 90 }, (_, i) =>
    Math.round(80 + Math.sin(i / 6) * 80 + Math.random() * 100),
  ),
}

export const mockCategorySales = [
  { name: 'Moda', value: 38, color: '#7BD3A8' },
  { name: 'Tech', value: 26, color: '#F7B267' },
  { name: 'Hogar', value: 18, color: '#A0C4FF' },
  { name: 'Belleza', value: 12, color: '#F4978E' },
  { name: 'Otros', value: 6, color: '#BDB2FF' },
]

export const mockRecentOrders = [
  {
    id: 'o1',
    customer: 'Ana G.',
    total: 45.9,
    status: 'Enviado',
    date: 'Hoy 14:20',
  },
  {
    id: 'o2',
    customer: 'Luis P.',
    total: 89,
    status: 'Pagado',
    date: 'Hoy 11:08',
  },
  {
    id: 'o3',
    customer: 'Sofía R.',
    total: 22.5,
    status: 'Pendiente',
    date: 'Ayer 19:42',
  },
  {
    id: 'o4',
    customer: 'Diego M.',
    total: 134,
    status: 'Enviado',
    date: 'Ayer 09:15',
  },
]

export const dashboardMock = {
  visits: 248,
  orders: 12,
  trending: '+12%',
}
