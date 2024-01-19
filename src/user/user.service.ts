import { UpdateUserDto } from './dto';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { GenericDTO, GenericObject, errorMessages } from 'src/constants/index';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  /*
  The filterData function is designed to create a reusable filter mechanism for DTOs in TypeScript.
  
  Parameters:
  - T: a generic type parameter constrained to extend GenericDTO, representing the type of the DTO.
  - _: a parameter representing the constructor of the DTO. It is intentionally ignored in the function body.
  
  Returns:
  - A function that takes a DTO of type T and filters out falsy key-value pairs, returning a GenericObject.

  Explanation:
  The inner function iterates over the keys of the input DTO, checks if the corresponding values are truthy,
  and constructs a new object containing only the truthy key-value pairs.

  Example Usage:
  const myFilter = filterData(MyDTO);
  const filteredData = myFilter({ prop1: 'value', prop2: 42, prop3: null });
*/

  filterData<T extends GenericDTO>(_: new () => T) {
    return function (dto: T): GenericObject {
      const data = {};
      // filter falsy data
      Object.keys(dto).forEach((key) => {
        if (dto[key]) {
          data[key] = dto[key];
        }
      });

      return data;
    };
  }

  async update(userId: User['id'], data: Partial<User>): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException(errorMessages.NO_USER);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data,
    });

    return updatedUser;
  }

  async updateUser(dto: UpdateUserDto, userId: User['id']) {
    const data = this.filterData(UpdateUserDto)(dto);

    try {
      const updatedUser = await this.update(userId, data);

      // TODO: refactor the functionality
      delete updatedUser.password;

      return updatedUser;
    } catch (error) {
      throw error;
    }
  }

  // TODO: update password
}
