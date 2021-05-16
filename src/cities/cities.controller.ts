import { Body, Post } from '@nestjs/common';
import { Controller, Get, Param } from '@nestjs/common';
import { CitiesService } from './cities.service';
import { SightsDto } from './dto/create-city.dto';
import { Roles } from 'src/auth/roles.decorator';
import { UseGuards } from '@nestjs/common';
import { RolesGuard } from 'src/auth/roles.guard';

@Controller(':dbname')
export class CitiesController {
  constructor(private citiesService: CitiesService) {}

  @Roles('admin', 'moderator', 'regular')
  @UseGuards(RolesGuard)
  @Get('/sights')
  get(@Param('dbname') db: string) {
    return this.citiesService.getSights(db);
  }

  @Roles('admin', 'moderator')
  @UseGuards(RolesGuard)
  @Post('/sights')
  add(@Param('dbname') db: string, @Body() dto: SightsDto) {
    return this.citiesService.addSights(db, dto);
  }
}
