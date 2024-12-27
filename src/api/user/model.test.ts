import mongoose from 'mongoose';
import User, { IUser } from './model';
import bcrypt from 'bcrypt';

describe('User Model Test', () => {
  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/planeet_test');
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  test('should create & save a user successfully', async () => {
    const userData: Partial<IUser> = {
      username: 'testuser',
      name: 'Test User',
      phoneNumber: '1234567890',
      email: 'testuser@example.com',
      password: 'password123',
      verifyCode: '123456',
      isVerified: true,
      role: 'user',
    };
    const validUser = new User(userData);
    const savedUser = await validUser.save();

    expect(savedUser._id).toBeDefined();
    expect(savedUser.username).toBe(userData.username);
    expect(savedUser.email).toBe(userData.email);
  });

  it('should hash the password before saving', async () => {
    const userData: Partial<IUser> = {
      username: 'testuser2',
      name: 'Test User 2',
      phoneNumber: '0987654321',
      email: 'testuser2@example.com',
      password: 'password123',
      verifyCode: '654321',
      isVerified: true,
      role: 'user',
    };
    const validUser = new User(userData);
    const savedUser = await validUser.save();

    const isMatch = await bcrypt.compare('password123', savedUser.password);
    expect(isMatch).toBe(true);
  });

  it('should generate access token', async () => {
    const userData: Partial<IUser> = {
      username: 'testuser3',
      name: 'Test User 3',
      phoneNumber: '1122334455',
      email: 'testuser3@example.com',
      password: 'password123',
      verifyCode: '789012',
      isVerified: true,
      role: 'user',
    };
    const validUser = new User(userData);
    const savedUser = await validUser.save();

    const accessToken = savedUser.generateAccessToken();
    expect(accessToken).toBeDefined();
  });

  it('should generate refresh token', async () => {
    const userData: Partial<IUser> = {
      username: 'testuser4',
      name: 'Test User 4',
      phoneNumber: '5566778899',
      email: 'testuser4@example.com',
      password: 'password123',
      verifyCode: '345678',
      isVerified: true,
      role: 'user',
    };
    const validUser = new User(userData);
    const savedUser = await validUser.save();

    const refreshToken = savedUser.generateRefreshToken();
    expect(refreshToken).toBeDefined();
  });

  it('should update projects', async () => {
    const userData: Partial<IUser> = {
      username: 'testuser5',
      name: 'Test User 5',
      phoneNumber: '6677889900',
      email: 'testuser5@example.com',
      password: 'password123',
      verifyCode: '901234',
      isVerified: true,
      role: 'user',
    };
    const validUser = new User(userData);
    const savedUser = await validUser.save();

    const projectId = new mongoose.Types.ObjectId();
    await savedUser.updateProjects(projectId);

    expect(savedUser.projects).toContainEqual(projectId);
  });

  it('should update tasks', async () => {
    const userData: Partial<IUser> = {
      username: 'testuser6',
      name: 'Test User 6',
      phoneNumber: '7788990011',
      email: 'testuser6@example.com',
      password: 'password123',
      verifyCode: '567890',
      isVerified: true,
      role: 'user',
    };
    const validUser = new User(userData);
    const savedUser = await validUser.save();

    const taskId = new mongoose.Types.ObjectId();
    await savedUser.updateTasks(taskId);

    expect(savedUser.tasks).toContainEqual(taskId);
  });

  it('should update completed tasks count', async () => {
    const userData: Partial<IUser> = {
      username: 'testuser7',
      name: 'Test User 7',
      phoneNumber: '8899001122',
      email: 'testuser7@example.com',
      password: 'password123',
      verifyCode: '678901',
      isVerified: true,
      role: 'user',
    };
    const validUser = new User(userData);
    const savedUser = await validUser.save();

    await savedUser.updateCompletedTasksCount();

    expect(savedUser.completedTasksCount).toBe(1);
  });
});