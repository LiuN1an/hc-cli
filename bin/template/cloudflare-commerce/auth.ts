import { DrizzleSQLiteAdapter } from '@lucia-auth/adapter-drizzle'
import { Lucia } from 'lucia'

import { db } from './db'
import { sessions, users, type User as DBUser } from './db/schema'

const adapter = new DrizzleSQLiteAdapter(db, sessions, users)

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    expires: false,
    attributes: {
      secure: process.env.NODE_ENV === 'production',
    },
  },
  getUserAttributes: (attributes) => {
    return {
      id: attributes.id,
      email: attributes.email,
      role: attributes.role,
    }
  },
})

declare module 'lucia' {
  interface Register {
    lucia: typeof lucia
    DatabaseUserAttributes: DBUser
  }
}
