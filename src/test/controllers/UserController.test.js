import { UserController } from '../../controllers/userController.js';
import { UserService } from '../../services/userService.js';
import { StatusCodes } from 'http-status-codes';

describe('UserController', () => {
    let mockReq, mockRes, mockNext;

    beforeEach(() => {
        mockReq = { body: {}, params: {}, headers: {}, query: {} };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        mockNext = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getAllUsers', () => {
        it('should return a list of users with status 200', async () => {
            // Mock UserService method inside the test
            const mockUsers = [{ id: 1, name: 'User1' }, { id: 2, name: 'User2' }];
            UserService.getAllUsers = jest.fn().mockResolvedValue(mockUsers);

            await UserController.getAllUsers(mockReq, mockRes, mockNext);

            expect(UserService.getAllUsers).toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.OK);
            expect(mockRes.json).toHaveBeenCalledWith({
                status: 'success',
                data: mockUsers,
            });
        });

        it('should call next with an error when service fails', async () => {
            // Mock UserService method inside the test
            const mockError = new Error('Service Error');
            UserService.getAllUsers = jest.fn().mockRejectedValue(mockError);

            await UserController.getAllUsers(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(mockError);
        });
    });

    describe('getUserById', () => {
        it('should return user data by ID with status 200', async () => {
            // Mock UserService method inside the test
            const mockUser = { id: 1, name: 'User1' };
            mockReq.params.id = '1'; // Thiết lập ID cho yêu cầu
            UserService.getUserById = jest.fn().mockResolvedValue(mockUser);

            await UserController.getUserById(mockReq, mockRes, mockNext);

            expect(UserService.getUserById).toHaveBeenCalledWith(mockReq.params.id);
            expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.OK);
            expect(mockRes.json).toHaveBeenCalledWith({
                status: 'success',
                data: mockUser,
            });
        });

        it('should call next with an error when service fails', async () => {
            // Mock UserService method inside the test
            const mockError = new Error('Service Error');
            UserService.getUserById = jest.fn().mockRejectedValue(mockError);

            await UserController.getUserById(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(mockError);
        });
    });

    describe('updateUserAvatar', () => {
        it('should update user avatar and return status 200', async () => {
            // Mock UserService method inside the test
            const mockResponse = { message: 'Avatar updated successfully' };
            UserService.updateUserAvatar = jest.fn().mockResolvedValue(mockResponse);

            await UserController.updateUserAvatar(mockReq, mockRes, mockNext);

            expect(UserService.updateUserAvatar).toHaveBeenCalledWith(mockReq);
            expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.OK);
            expect(mockRes.json).toHaveBeenCalledWith({
                status: 'success',
                data: mockResponse,
            });
        });

        it('should call next with an error when service fails', async () => {
            // Mock UserService method inside the test
            const mockError = new Error('Service Error');
            UserService.updateUserAvatar = jest.fn().mockRejectedValue(mockError);

            await UserController.updateUserAvatar(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(mockError);
        });
    });
});
