import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put, Query
} from "@nestjs/common";
import { MoviesService } from "./movies.service";
import { Movie } from "./entities/movie.entity";
import { CreateMovieDto } from "./dto/create-movie.dto";
import { UpdateMovieDto } from "./dto/update-movie.dto";

@Controller("movies")
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get()
  getAll(): Movie[] {
    return this.moviesService.getAll();
  }

  @Get("/search")
  search(@Query("year") searchingYear: number) {
    // id보다 밑에 있으면 'search'가 id라고 생각함...
    // search?year=2000
    return `we are searching a movie year: ${searchingYear}`;
  }

  @Get("/:id")
  getOne(@Param("id") id: number): Movie {
    return this.moviesService.getOne(id);
  }

  @Post()
  create(@Body() movieData: CreateMovieDto) {
    return this.moviesService.create(movieData);
  }

  @Put("/:id")
  update(@Param("id") id: number, @Body() updateData: UpdateMovieDto) {
    return this.moviesService.update(id, updateData);
  }

  @Delete("/:id")
  remove(@Param("id") id: number) {
    return this.moviesService.deleteOne(id);
  }
}
