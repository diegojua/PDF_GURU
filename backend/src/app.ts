import cors from 'cors';
import express, { Request, Response } from 'express';
import helmet from 'helmet';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { jwtSecret, tenants, tokenExpiration, TenantDefinition } from './tenants';

export const app = express();

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : ['http://localhost:3000', 'http://localhost:8081'];

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // Permite requests sem origin (ex: mobile app nativo, Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  }),
);
app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

const getTenant = (tenantId: string | undefined): TenantDefinition | null => {
  if (!tenantId) return null;
  return tenants.find((tenant) => tenant.id === tenantId) ?? null;
};

const authorize = (req: Request, res: Response, next: () => void) => {
  const tenantId = req.header('x-tenant-id');
  const authorization = req.header('authorization');

  if (!tenantId || !authorization?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Tenant and authorization headers are required.' });
  }

  const token = authorization.replace('Bearer ', '');
  const tenant = getTenant(tenantId);

  if (!tenant) {
    return res.status(400).json({ message: 'Invalid tenant.' });
  }

  try {
    const payload = jwt.verify(token, jwtSecret) as {
      tenantId: string;
      userId: string;
      type?: string;
    };
    if (payload.type !== 'access') {
      return res.status(401).json({ message: 'Invalid token type.' });
    }
    if (payload.tenantId !== tenantId) {
      return res.status(403).json({ message: 'Token does not match tenant.' });
    }

    req.tenant = tenant;
    req.userId = payload.userId;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token.' });
  }
};

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts. Try again in 15 minutes.' },
});

app.post('/auth/login', loginLimiter, (req: Request, res: Response) => {
  const tenantId = req.header('x-tenant-id');
  const tenant = getTenant(tenantId);

  if (!tenant) {
    return res.status(400).json({ message: 'Tenant not found.' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const user = tenant.users.find((item) => item.email === email && item.password === password);

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  const token = jwt.sign({ tenantId: tenant.id, userId: user.userId, type: 'access' }, jwtSecret, {
    expiresIn: tokenExpiration,
  });
  const refreshToken = jwt.sign(
    { tenantId: tenant.id, userId: user.userId, type: 'refresh' },
    jwtSecret,
    { expiresIn: '7d' },
  );

  return res.json({ token, refreshToken, user: { email: user.email, name: user.name } });
});

const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many refresh attempts. Try again in 15 minutes.' },
});

app.post('/auth/refresh', refreshLimiter, (req: Request, res: Response) => {
  const tenantId = req.header('x-tenant-id');
  const tenant = getTenant(tenantId);

  if (!tenant) {
    return res.status(400).json({ message: 'Tenant not found.' });
  }

  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh token is required.' });
  }

  try {
    const payload = jwt.verify(refreshToken, jwtSecret) as {
      tenantId: string;
      userId: string;
      type?: string;
    };
    if (payload.type !== 'refresh') {
      return res.status(401).json({ message: 'Invalid token type.' });
    }
    if (payload.tenantId !== tenant.id) {
      return res.status(403).json({ message: 'Invalid refresh token.' });
    }

    const token = jwt.sign(
      { tenantId: tenant.id, userId: payload.userId, type: 'access' },
      jwtSecret,
      { expiresIn: tokenExpiration },
    );
    return res.json({ token });
  } catch {
    return res.status(401).json({ message: 'Invalid refresh token.' });
  }
});

app.get('/documents', authorize, (req: Request, res: Response) => {
  const tenant = req.tenant as TenantDefinition;
  return res.json({ documents: tenant.documents });
});

app.get('/documents/:documentId/download', authorize, (req: Request, res: Response) => {
  const tenant = req.tenant as TenantDefinition;
  const documentId = req.params.documentId;
  const document = tenant.documents.find((item) => item.id === documentId);

  if (!document) {
    return res.status(404).json({ message: 'Document not found.' });
  }

  const url = `https://example.com/mock/${tenant.id}/${document.id}.pdf`;
  return res.json({ url });
});
