import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  writeBatch,
  Unsubscribe 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Product, Order, ProductReview } from '../types';
import { INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_REVIEWS } from '../data/initialData';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore with the provisioned database ID
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

let isSeedingProducts = false;
let isSeedingOrders = false;
let isSeedingReviews = false;

/**
 * Real-time Product Catalog Listener
 * Subscribes to the live Firestore database.
 * If empty on initial launch, seeds with the initial luxury skincare catalog.
 */
export const subscribeToProductsLive = (
  onProductsUpdate: (products: Product[]) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  const productsRef = collection(db, 'products');

  return onSnapshot(
    productsRef,
    async (snapshot) => {
      if (snapshot.empty && !isSeedingProducts) {
        isSeedingProducts = true;
        try {
          console.info('Firestore products collection empty. Seeding initial catalog...');
          const batch = writeBatch(db);
          for (const product of INITIAL_PRODUCTS) {
            const productDoc = doc(db, 'products', product.id);
            batch.set(productDoc, { ...product, updatedAt: new Date().toISOString() });
          }
          await batch.commit();
          console.info('Firestore products successfully seeded.');
        } catch (err) {
          console.error('Error seeding initial products to Firestore:', err);
        } finally {
          isSeedingProducts = false;
        }
        return;
      }

      const products: Product[] = [];
      snapshot.forEach((docSnap) => {
        products.push(docSnap.data() as Product);
      });

      // Maintain catalog order: featured first, then newest
      products.sort((a, b) => {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return (b.createdAt || '').localeCompare(a.createdAt || '');
      });

      onProductsUpdate(products);
    },
    (err) => {
      console.error('Firestore products onSnapshot error:', err);
      if (onError) onError(err);
    }
  );
};

/**
 * Save or update a single product in live Firestore
 */
export const saveProductToFirestore = async (product: Product): Promise<void> => {
  const productDoc = doc(db, 'products', product.id);
  await setDoc(productDoc, {
    ...product,
    updatedAt: new Date().toISOString()
  }, { merge: true });
};

/**
 * Batch save/update all products in Firestore (e.g. after import or mass update)
 */
export const saveProductsBatchToFirestore = async (products: Product[]): Promise<void> => {
  const batch = writeBatch(db);
  for (const product of products) {
    const productDoc = doc(db, 'products', product.id);
    batch.set(productDoc, {
      ...product,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  }
  await batch.commit();
};

/**
 * Delete a product from live Firestore
 */
export const deleteProductFromFirestore = async (productId: string): Promise<void> => {
  const productDoc = doc(db, 'products', productId);
  await deleteDoc(productDoc);
};

/**
 * Real-time Customer Orders Listener
 * Subscribes to live orders from all devices.
 */
export const subscribeToOrdersLive = (
  onOrdersUpdate: (orders: Order[]) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  const ordersRef = collection(db, 'orders');

  return onSnapshot(
    ordersRef,
    async (snapshot) => {
      if (snapshot.empty && !isSeedingOrders) {
        isSeedingOrders = true;
        try {
          console.info('Firestore orders collection empty. Seeding initial demonstration orders...');
          const batch = writeBatch(db);
          for (const order of INITIAL_ORDERS) {
            const orderDoc = doc(db, 'orders', order.id);
            batch.set(orderDoc, { ...order, updatedAt: new Date().toISOString() });
          }
          await batch.commit();
        } catch (err) {
          console.error('Error seeding initial orders to Firestore:', err);
        } finally {
          isSeedingOrders = false;
        }
        return;
      }

      const orders: Order[] = [];
      snapshot.forEach((docSnap) => {
        orders.push(docSnap.data() as Order);
      });

      // Sort newest order first
      orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      onOrdersUpdate(orders);
    },
    (err) => {
      console.error('Firestore orders onSnapshot error:', err);
      if (onError) onError(err);
    }
  );
};

/**
 * Save new customer order to live Firestore
 */
export const saveOrderToFirestore = async (order: Order): Promise<void> => {
  const orderDoc = doc(db, 'orders', order.id);
  await setDoc(orderDoc, {
    ...order,
    updatedAt: new Date().toISOString()
  }, { merge: true });
};

/**
 * Update order status (Pending, Confirmed, Dispatched, Delivered) in live Firestore
 */
export const updateOrderStatusInFirestore = async (
  orderId: string, 
  status: Order['status']
): Promise<void> => {
  const orderDoc = doc(db, 'orders', orderId);
  await setDoc(orderDoc, {
    status,
    updatedAt: new Date().toISOString()
  }, { merge: true });
};

/**
 * Delete an order from live Firestore
 */
export const deleteOrderFromFirestore = async (orderId: string): Promise<void> => {
  const orderDoc = doc(db, 'orders', orderId);
  await deleteDoc(orderDoc);
};

/**
 * Real-time Reviews Listener
 */
export const subscribeToReviewsLive = (
  onReviewsUpdate: (reviews: ProductReview[]) => void
): Unsubscribe => {
  const reviewsRef = collection(db, 'reviews');

  return onSnapshot(
    reviewsRef,
    async (snapshot) => {
      if (snapshot.empty && !isSeedingReviews) {
        isSeedingReviews = true;
        try {
          const batch = writeBatch(db);
          for (const review of INITIAL_REVIEWS) {
            const reviewDoc = doc(db, 'reviews', review.id);
            batch.set(reviewDoc, review);
          }
          await batch.commit();
        } catch (err) {
          console.error('Error seeding reviews:', err);
        } finally {
          isSeedingReviews = false;
        }
        return;
      }

      const reviews: ProductReview[] = [];
      snapshot.forEach((docSnap) => {
        reviews.push(docSnap.data() as ProductReview);
      });
      onReviewsUpdate(reviews);
    },
    (err) => {
      console.error('Firestore reviews onSnapshot error:', err);
    }
  );
};

/**
 * Save review to live Firestore
 */
export const saveReviewToFirestore = async (review: ProductReview): Promise<void> => {
  const reviewDoc = doc(db, 'reviews', review.id);
  await setDoc(reviewDoc, review, { merge: true });
};

/**
 * Delete review from live Firestore
 */
export const deleteReviewFromFirestore = async (reviewId: string): Promise<void> => {
  const reviewDoc = doc(db, 'reviews', reviewId);
  await deleteDoc(reviewDoc);
};

