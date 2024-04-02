import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ObjectId } from 'mongoose';
import { User } from 'src/auth/schemas/use.schema';

export class CreateBookDto {
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @IsNotEmpty()
  @IsString()
  readonly description: string;

  @IsNotEmpty()
  @IsString()
  readonly brand: string;


  readonly price: number;

  @IsNotEmpty()
  @IsString()
  readonly category: string;

  @IsOptional()
  @IsNotEmpty({ message: 'You cannot pass user id' })
  readonly user: User;

  readonly isFav: boolean;

  @IsArray()
  @IsOptional()
  @ArrayUnique()
  @ArrayNotEmpty()
  favourites: ObjectId[];

  images: string[];

  @IsString()
  state: string;
}
