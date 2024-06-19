import { Response } from 'express';
import {
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';

export function handleHttpError(response: Response, error: Error): void {
  if (error instanceof NotFoundException) {
    response.sendStatus(404);
  } else if (error instanceof BadRequestException) {
    response.sendStatus(400);
  } else if (error instanceof UnauthorizedException) {
    response.sendStatus(401);
  } else if (error instanceof ForbiddenException) {
    response.sendStatus(403);
  } else if (error instanceof InternalServerErrorException) {
    response.sendStatus(500);
  } else {
    response.sendStatus(500);
  }
}
