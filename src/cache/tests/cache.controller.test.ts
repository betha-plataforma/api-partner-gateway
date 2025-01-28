import { jest } from '@jest/globals';
import { Request, Response } from 'express';
import { CacheController } from '../cache.controller.js';
import { CacheProviderFactory } from '../cache.provider.factory.js';

jest.mock('../cache.provider.factory');

describe('CacheController', () => {
    let cacheController: CacheController;
    let mockCacheProvider: any;
    let req: Partial<Request>;
    let res: Partial<Response>;

    beforeEach(() => {
        mockCacheProvider = {
            clearAll: jest.fn()
        };
        (CacheProviderFactory.createCacheProvider as jest.Mock).mockReturnValue(mockCacheProvider);

        cacheController = new CacheController();

        req = {};
        res = {
            status: jest.fn().mockReturnThis() as unknown as (code: number) => Response,
            json: jest.fn() as unknown as (body: any) => Response
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should clear all cache and return a success message', async () => {
        mockCacheProvider.clearAll.mockResolvedValueOnce(undefined);

        await cacheController.clearAllCache(req as Request, res as Response);

        expect(mockCacheProvider.clearAll).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: 'All cache cleared successfully.' });
    });

    test('should return an error message if clearing cache fails', async () => {
        const error = new Error('Failed to clear cache');
        mockCacheProvider.clearAll.mockRejectedValueOnce(error);

        await cacheController.clearAllCache(req as Request, res as Response);

        expect(mockCacheProvider.clearAll).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error });
    });
});
