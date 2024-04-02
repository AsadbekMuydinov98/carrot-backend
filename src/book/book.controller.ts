import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Patch,
} from '@nestjs/common';
import { BookService } from './book.service';
import { Book } from './schema/book.schema';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Query as ExpressQuery } from 'express-serve-static-core';
import { AuthGuard } from '@nestjs/passport';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { User } from 'src/auth/schemas/use.schema';
import { JwtService } from '@nestjs/jwt';

@Controller('books')
export class BookController {
  constructor(
    private bookService: BookService,
    private jwtService: JwtService,
  ) {}

  // products for home page -----------------------------------------------------------------------------
  @Get()
  async getAllBooks(@Query() query: ExpressQuery): Promise<Book[]> {
    return this.bookService.findAll(query);
  }

  // all products ---------------------------------------------------------------------------------------
  @Get('all')
  async getAllBookss(): Promise<Book[]> {
    return this.bookService.findAlls();
  }

  // only products for login user -----------------------------------------------------------------------
  @Get('mine')
  async getMyBooks(@Req() req: Request): Promise<Book[]> {
    return this.bookService.findMyBooks(req);
  }

  // adding favourite product ---------------------------------------------------------------------------
  @Post('addfavourite/:id')
  async addFavourite(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<Book> {
    return this.bookService.addFavourite(id, req);
  }

  // removing favourite product -------------------------------------------------------------------------
  @Post('refavourite/:id')
  async removeFavourite(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<Book> {
    return this.bookService.removeFavourite(id, req);
  }

  // getting products which user's favourite ------------------------------------------------------------
  @Get('myfavourite')
  async getMyFavourites(@Req() req: Request): Promise<Book[]> {
    return this.bookService.getMyFavourites(req);
  }

  // create new product ---------------------------------------------------------------------------------
  @Post('create')
  @UseGuards(AuthGuard())
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      storage: diskStorage({
        destination: './upload',
        filename: (req, file, callBack) => {
          const fileName =
            path.parse(file.originalname).name.replace(/\s/g, ' ') + Date.now();
          const extension = path.parse(file.originalname).ext;
          callBack(null, `${fileName}${extension}`);
        },
      }),
    }),
  )
  async create(
    @UploadedFiles() images: Express.Multer.File[],
    @Body() bookDto: CreateBookDto,
    @Req() req,
  ): Promise<Book> {
    return this.bookService.create(bookDto, images, req.user);
  }

  // update product -------------------------------------------------------------------------------------
  @Patch(':id')
  @UseGuards(AuthGuard())
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      storage: diskStorage({
        destination: './upload',
        filename: (req, file, callBack) => {
          const fileName =
            path.parse(file.originalname).name.replace(/\s/g, '_') + Date.now();
          const extension = path.parse(file.originalname).ext;
          callBack(null, `${fileName}${extension}`);
        },
      }),
    }),
  )
  async patch(
    @UploadedFiles() images: Express.Multer.File[],
    @Body() updateBookDto: UpdateBookDto,
    @Param('id') id: string,
  ): Promise<Book> {
    return this.bookService.updateBook(id, updateBookDto, images);
  }


  @Get(':id')
  async findById(@Param('id') id: string): Promise<Book> {
    return this.bookService.findById(id)
  }

  // update state ----------------------------------------------------------------------------------------
  @Patch('my/:id')
  async updateProductState(
    @Param('id') id: string,
    @Body() state: { state: string },
  ): Promise<Book> {
    return await this.bookService.updateState(id, state.state);
}

  // deleting product -----------------------------------------------------------------------------------
  @Delete(':id')
  async deleteProduct(@Param('id') id: string): Promise<{ message: string }> {
    return await this.bookService.deleteProduct(id);
  }
}