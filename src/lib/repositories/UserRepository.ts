import { query } from '@/lib/db';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  full_name?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserDTO {
  email: string;
  password_hash: string;
  full_name?: string;
}

export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const result = await query<User>(
      'SELECT * FROM profiles WHERE email = $1 LIMIT 1',
      [email]
    );

    return result.rows[0] || null;
  }

  async findById(id: string): Promise<User | null> {
    const result = await query<User>(
      'SELECT * FROM profiles WHERE id = $1 LIMIT 1',
      [id]
    );

    return result.rows[0] || null;
  }

  async create(dto: CreateUserDTO): Promise<User> {
    const result = await query<User>(
      `INSERT INTO profiles (id, email, password_hash, full_name, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, NOW(), NOW())
       RETURNING *`,
      [dto.email, dto.password_hash, dto.full_name || null]
    );

    if (!result.rows[0]) {
      throw new Error('Failed to create user');
    }

    return result.rows[0];
  }

  async updatePassword(userId: string, newPasswordHash: string): Promise<void> {
    await query(
      'UPDATE profiles SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [newPasswordHash, userId]
    );
  }

  async deleteById(userId: string): Promise<void> {
    await query('DELETE FROM profiles WHERE id = $1', [userId]);
  }
}

export const userRepository = new UserRepository();
