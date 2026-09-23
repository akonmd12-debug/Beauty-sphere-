import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Pre-computed seed hashes (BCrypt Blowfish 10 rounds)
const INITIAL_ADMIN_HASH = bcrypt.hashSync('00998877', 10);
const INITIAL_MERCHANT_HASH = bcrypt.hashSync('merchant2026', 10);

// In-memory / persisted database of registered server-side users
interface ServerUser {
  id: string;
  username: string;
  email: string;
  displayName: string;
  role: 'admin' | 'merchant_moderator';
  passwordHash: string;
  passwordChangedAt?: string;
  status: string;
}

const SERVER_USERS: ServerUser[] = [
  {
    id: 'user_admin_master',
    username: 'akonmd12@gmail.com',
    email: 'akonmd12@gmail.com',
    displayName: 'Master Administrator (Akon MD)',
    role: 'admin',
    passwordHash: INITIAL_ADMIN_HASH,
    status: 'active'
  },
  {
    id: 'user_merchant_moderator',
    username: 'merchant@beautysphere.com',
    email: 'merchant@beautysphere.com',
    displayName: 'Sole Merchant & Store Moderator',
    role: 'merchant_moderator',
    passwordHash: INITIAL_MERCHANT_HASH,
    status: 'active'
  }
];

// File-backed storage for server credentials persistence across restarts
const CREDENTIALS_FILE = path.resolve(__dirname, '.server_credentials.json');

function loadPersistedUsers(): void {
  try {
    if (fs.existsSync(CREDENTIALS_FILE)) {
      const data = fs.readFileSync(CREDENTIALS_FILE, 'utf-8');
      const parsed = JSON.parse(data) as ServerUser[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        parsed.forEach((pu) => {
          const idx = SERVER_USERS.findIndex((u) => u.id === pu.id || u.username === pu.username);
          if (idx >= 0) {
            SERVER_USERS[idx] = pu;
          } else {
            SERVER_USERS.push(pu);
          }
        });
      }
    }
  } catch (e) {
    console.warn('Could not load .server_credentials.json, using seed users:', e);
  }
}

function persistUsers(): void {
  try {
    fs.writeFileSync(CREDENTIALS_FILE, JSON.stringify(SERVER_USERS, null, 2), 'utf-8');
  } catch (e) {
    console.warn('Could not persist credentials:', e);
  }
}

loadPersistedUsers();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json());

  // -----------------------------------------------------------
  // SERVER-SIDE STRICT BCRYPT CREDENTIAL VALIDATION ENDPOINT
  // -----------------------------------------------------------
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { identifier, password, expectedRole } = req.body;

    const cleanId = (identifier || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    if (!cleanId || !cleanPass) {
      return res.status(400).json({
        success: false,
        error: 'Email/Username and password are required.'
      });
    }

    // Lookup user in server-side registry
    const user = SERVER_USERS.find(
      (u) => u.username.toLowerCase() === cleanId || u.email.toLowerCase() === cleanId
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Account not found. Please verify your credentials.'
      });
    }

    // Role verification
    if (expectedRole && user.role !== expectedRole) {
      return res.status(403).json({
        success: false,
        error: `Access Denied: Account role '${user.role}' is not authorized for this portal.`
      });
    }

    // Strictly validate encrypted password on the server-side with BCrypt
    let isMatch = false;
    try {
      if (user.passwordHash.startsWith('$2a$') || user.passwordHash.startsWith('$2b$') || user.passwordHash.startsWith('$2y$')) {
        isMatch = bcrypt.compareSync(cleanPass, user.passwordHash);
      } else {
        isMatch = cleanPass === user.passwordHash;
      }
    } catch (bcryptErr) {
      console.error('Server BCrypt verification failed:', bcryptErr);
      isMatch = false;
    }

    // Fallback for default seed password before first change
    if (!isMatch && !user.passwordChangedAt) {
      if (user.role === 'admin' && cleanPass === '00998877') {
        isMatch = true;
      } else if (user.role === 'merchant_moderator' && cleanPass === 'merchant2026') {
        isMatch = true;
      }
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid password. Credentials could not be verified by the server.'
      });
    }

    // Successful server-side authentication
    return res.status(200).json({
      success: true,
      message: 'Server-side BCrypt validation successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        status: user.status
      },
      role: user.role
    });
  });

  // Server-side password update with BCrypt encryption
  app.post('/api/auth/change-password', (req: Request, res: Response) => {
    const { identifier, oldPassword, newPassword } = req.body;

    const cleanId = (identifier || '').trim().toLowerCase();
    const cleanOld = (oldPassword || '').trim();
    const cleanNew = (newPassword || '').trim();

    if (!cleanId || !cleanOld || !cleanNew) {
      return res.status(400).json({
        success: false,
        error: 'Identifier, current password, and new password are required.'
      });
    }

    if (cleanNew.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 6 characters long.'
      });
    }

    const user = SERVER_USERS.find(
      (u) => u.username.toLowerCase() === cleanId || u.email.toLowerCase() === cleanId
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Account not found.'
      });
    }

    // Validate old password
    const isOldMatch = bcrypt.compareSync(cleanOld, user.passwordHash) ||
      (!user.passwordChangedAt && ((user.role === 'admin' && cleanOld === '00998877') || (user.role === 'merchant_moderator' && cleanOld === 'merchant2026')));

    if (!isOldMatch) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect.'
      });
    }

    // Encrypt new password on server with 10 rounds
    const newHash = bcrypt.hashSync(cleanNew, 10);
    user.passwordHash = newHash;
    user.passwordChangedAt = new Date().toISOString();
    persistUsers();

    return res.status(200).json({
      success: true,
      message: 'Password successfully encrypted and updated on the server.'
    });
  });

  // Health check endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      app: 'BEAUTY SPHERE SHOP',
      serverTime: new Date().toISOString()
    });
  });

  // -----------------------------------------------------------
  // VITE DEV MIDDLEWARE OR STATIC PRODUCTION SERVING
  // -----------------------------------------------------------
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BEAUTY SPHERE server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
