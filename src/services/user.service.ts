import { userRepository } from '../repositories/user.repository.js';

type UserFilters = {
  role?: string;
  status?: string;
};

export class UserService {
  async getUsers(filters: UserFilters) {
    return userRepository.findAll(filters);
  }
}

export const userService = new UserService();
