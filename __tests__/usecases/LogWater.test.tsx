import { describe, it, expect, vi } from 'vitest';
import { LogWater } from '@/usecases/LogWater';

// Mock repository
const mockWaterRepository = {
  create: vi.fn()
};

describe('LogWater UseCase', () => {
  it('should log water intake successfully', async () => {
    const logWater = new LogWater(mockWaterRepository);
    const input = {
      userId: 'test-user-id',
      ml: 250,
      at: '2025-01-27T10:00:00.000Z'
    };

    mockWaterRepository.create.mockResolvedValue({
      id: '1',
      ...input
    });

    const result = await logWater.exec(input);

    expect(mockWaterRepository.create).toHaveBeenCalledWith(input);
    expect(result).toEqual({
      id: '1',
      ...input
    });
  });

  it('should validate input data', async () => {
    const logWater = new LogWater(mockWaterRepository);
    const invalidInput = {
      userId: '',
      ml: -100,
      at: 'invalid-date'
    };

    await expect(logWater.exec(invalidInput)).rejects.toThrow();
  });
});