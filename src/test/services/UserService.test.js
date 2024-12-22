import {UserService} from "../../services/userService.js";
import User from '../../models/User.js';
import bcrypt from 'bcrypt';
import BadRequestError from "../../errors/BadRequestError.js";
import NotFoundError from "../../errors/NotFoundError.js";

jest.mock('../../models/User.js');

describe('UserService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('getAllUsers should return all users', async () => {
    const mockUsers = [{ _id: '1', fullname: 'User1' }, { _id: '2', fullname: 'User2' }];
    User.find.mockResolvedValue(mockUsers);

    const users = await UserService.getAllUsers();
    expect(users).toEqual(mockUsers);
    expect(User.find).toHaveBeenCalledTimes(1);
  });

  test('getUserByToken should return user by token', async () => {
    const mockUser = { _id: '1', fullname: 'User1' };
    const req = { userId: '1' };
    User.findById.mockResolvedValue(mockUser);

    const user = await UserService.getUserByToken(req);
    expect(user).toEqual(mockUser);
    expect(User.findById).toHaveBeenCalledWith(req.userId);
  });

  test('getUserByToken should throw NotFoundError if user not found', async () => {
    const req = { userId: '1' };
    User.findById.mockResolvedValue(null);

    await expect(UserService.getUserByToken(req)).rejects.toThrow(NotFoundError);
  });

  test('getUserById should return user by id', async () => {
    const mockUser = { _id: '1', fullname: 'User1' };
    const data = { params: { id: '1' } };
    User.findById.mockResolvedValue(mockUser);

    const user = await UserService.getUserById(data);
    expect(user).toEqual(mockUser);
    expect(User.findById).toHaveBeenCalledWith(data.params.id);
  });

  test('getUserById should throw BadRequestError if id is invalid', async () => {
    const data = { params: { id: null } };
    
    await expect(UserService.getUserById(data)).rejects.toThrow(BadRequestError);
  });

  test('updateUserInfo should update user information', async () => {
    const mockUser = { _id: '1', fullname: 'User1', save: jest.fn() };
    const req = {
      params: { id: '1' },
      body: { fullname: 'User Updated', email: 'user@example.com' },
    };
    User.findById.mockResolvedValue(mockUser);

    const user = await UserService.updateUserInfo(req);
    expect(user.fullname).toBe('User Updated');
    expect(user.email).toBe('user@example.com');
    expect(mockUser.save).toHaveBeenCalledTimes(1);
  });

  test('updateUserProfile should update user profile and password', async () => {
    const oldPassword = 'oldPassword123';
    const newPassword = 'newPassword456';

    const mockUser = {
        _id: '1',
        password: await bcrypt.hash(oldPassword, 10),
        fullname: 'Old User',
        avatar: 'oldAvatarPath',
        save: jest.fn(),
    };

    const req = {
        userId: '1',
        body: {
            oldPassword,
            password: newPassword,
            fullname: 'User Updated',
        },
        file: { path: 'newAvatarPath' },
    };

    User.findById.mockResolvedValue(mockUser);

    const originalPassword = mockUser.password; // Lưu mật khẩu ban đầu

    const user = await UserService.updateUserProfile(req);

    expect(user.fullname).toBe('User Updated');
    expect(await bcrypt.compare(newPassword, user.password)).toBe(true);
    expect(await bcrypt.compare(oldPassword, user.password)).toBe(false); // Xác nhận mật khẩu đã thay đổi
    expect(user.password).not.toBe(originalPassword); // Kiểm tra giá trị đã băm khác với ban đầu
    expect(mockUser.save).toHaveBeenCalledTimes(1);
  });

  test('updateUserAvatar should update user avatar', async () => {
    const mockUser = { _id: '1', avatar: '', save: jest.fn() };
    const req = {
      params: { id: '1' },
      file: { path: 'newAvatarPath' },
    };
    User.findById.mockResolvedValue(mockUser);

    const user = await UserService.updateUserAvatar(req);
    expect(user.avatar).toBe('newAvatarPath');
    expect(mockUser.save).toHaveBeenCalledTimes(1);
  });

  test('updateUserAvatar should throw BadRequestError if parameters are invalid', async () => {
    const req = { params: { id: null }, file: { path: 'newAvatarPath' } };
    
    await expect(UserService.updateUserAvatar(req)).rejects.toThrow(BadRequestError);
  });
});
