import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Book } from './schema/book.schema';
import mongoose from 'mongoose';
import { Query } from 'express-serve-static-core';
import { User } from 'src/auth/schemas/use.schema';
import { JwtService } from '@nestjs/jwt';
import { UpdateBookDto } from './dto/update-book.dto';



@Injectable()
export class BookService {
  

  constructor(
    @InjectModel(Book.name)
    private bookModel: mongoose.Model<Book>,
    private jwtService: JwtService,
  ){}

  // products for home page -----------------------------------------------------------------------------
  async findAll(query: Query): Promise<Book[]>{
    const resPerPage = 5
    const currentPage = Number(query.page) || 1
    const skip = resPerPage * (currentPage-1)
    const keyword = query.keyword
      ? {
          title: {
            $regex: query.keyword,
            $options: 'i',
          },
        }
      : {};
    const books = await this.bookModel
      .find({ ...keyword })
      .sort({ createdAt: -1 })
      .limit(resPerPage)
      .skip(skip);
    return books
  }

  // all products ---------------------------------------------------------------------------------------
  async findAlls(): Promise<Book[]> {
    const books = await this.bookModel.find().exec();
    return books;
  }


  // only products for login user -----------------------------------------------------------------------
  async findMyBooks(req): Promise<Book[]> {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      throw new UnauthorizedException('Token not found');
    }
    
    try {
      const decoded = this.jwtService.verify(token);
      const userId = decoded.id;
      const myBooks = await this.bookModel.find({ user: userId });
      return myBooks;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
}

  // adding favourite product ---------------------------------------------------------------------------
  async addFavourite(bookId: string, req): Promise<Book> {
    const token = req.body.headers.Authorization?.split(' ')[1];
    try {
      const decodedToken = this.jwtService.verify(token);
      const userId = decodedToken.id;
      const book = await this.bookModel.findById({ _id: bookId });
      if (!book) {
        throw new Error('Kitob topilmadi');
      }
      if (book.user.toString() === userId) {
        throw new UnauthorizedException('It is your product');
      }
      if (book.favourites.includes(userId)) {
        throw new Error('It has been already favourite');
      }
      book.favourites.push(userId);
      book.isFav = true;
      await book.save();
      return book;
    } catch (error) {
      throw new UnauthorizedException('Wrong token or product ID');
    }
  }

  // removing favourite product -------------------------------------------------------------------------
  async removeFavourite(bookId: string, req): Promise<Book> {
    const token = req.body.headers.Authorization?.split(' ')[1];
    try {
      const decodedToken = this.jwtService.verify(token);
      const userId = decodedToken.id;

      const book = await this.bookModel.findById({ _id: bookId });
      if (!book) {
        throw new NotFoundException('Mahsulot topilmadi');
      }

      const index = book.favourites.indexOf(userId);
      if (index === -1) {
        throw new NotFoundException('Siz bu mahsulotni sevimli qilmagansiz');
      }

      book.favourites.splice(index, 1);
      book.isFav = false;

      return await book.save();
    } catch (error) {
      throw error;
    }
  }

  // getting products which user's favourite ------------------------------------------------------------
  async getMyFavourites(req): Promise<Book[]> {
    const token = req.headers.authorization?.split(' ')[1];
    
    try {
      const decodedToken = this.jwtService.verify(token);
      const userId = decodedToken.id;
      const favouriteBooks = await this.bookModel.find({ favourites: userId });
      return favouriteBooks;
    } catch (error) {
      throw new UnauthorizedException("Noto'g'ri token yoki foydalanuvchi ID");
    }
  }

  // create new product ---------------------------------------------------------------------------------
  async create(
    book: Book,
    images: Express.Multer.File[],
    user: User,
  ): Promise<Book> {
    const data = Object.assign(
      book,
      { images: images.map((image) => image.path) },
      { user },
    );
    const res = await this.bookModel.create(data);
    return res;
  }

  async findById(id: string): Promise<Book> {
    const isValidId = mongoose.isValidObjectId(id);

    if (!isValidId) {
      throw new BadRequestException('Please enter correct id.');
    }

    const book = await this.bookModel.findById(id).populate({
      path: 'user',
      select: 'name tel' 
    })

    if (!book) {
      throw new NotFoundException('Book not found.');
    }

    return book;
  }


  // update product -------------------------------------------------------------------------------------
  async updateBook(
    id: string,
    updateData: UpdateBookDto, 
    images: Express.Multer.File[], 
  ): Promise<Book> {
    const dataToUpdate =
      images.length > 0
        ? {
            ...updateData,
            images: images.map((image) => image.path),
          }
        : {
            ...updateData,
          };
    const updatedBook = await this.bookModel.findByIdAndUpdate(
      id,
      dataToUpdate,
      { new: true },
    );

    return updatedBook;
  }

  // update state ----------------------------------------------------------------------------------------
  async updateState(id: string, state: string): Promise<Book> {    
    return await this.bookModel.findByIdAndUpdate(
      id,
      { state: state },
      { new: true },
    );
  }



  // deleting product -----------------------------------------------------------------------------------
  async deleteProduct(productId: string): Promise<{ message: string }> {
    try {
      const deletedProduct = await this.bookModel.findByIdAndDelete(productId);
      if (!deletedProduct) {
        throw new NotFoundException('Mahsulot topilmadi');
      }
      return { message: "Mahsulot o'chirib yuborildi" };
    } catch (error) {
      throw error;
    }
  }
}
