import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ObjectId } from 'mongoose';
import { User } from 'src/auth/schemas/use.schema';

export class UpdateBookDto {
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

  readonly isFav: boolean;

  @IsArray()
  @IsOptional()
  @ArrayUnique()
  @ArrayNotEmpty()
  favourites: ObjectId[];

  images: string[];

  @IsString()
  @IsIn(['For sale', 'Reserved', 'Sold'])
  state: string;
}
