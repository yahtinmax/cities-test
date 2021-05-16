import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Sight, SightDocument, SightSchema } from '../models/sight.schema';
import { connection, Connection, Document, Model } from 'mongoose';

@Injectable()
export class CitiesService {
  constructor(@InjectConnection() private connection: Connection) {}
  async getSights(dbname: string): Promise<Document<Sight>[]> {
    if (dbname === 'users') {
      throw new HttpException('Permissions denied', HttpStatus.BAD_REQUEST);
    }

    try {
      const db = await this.connectToSight(connection, dbname);
      const Sight = await db.model('Sight', SightSchema);
      const sights = await Sight.find();
      await db.close();
      return sights;
    } catch (e) {
      throw new HttpException(
        `Something going wrong ${e.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async addSights(dbname: string, dto): Promise<Document<Sight>> {
    if (dbname === 'users') {
      throw new HttpException('Permissions denied', HttpStatus.BAD_REQUEST);
    }
    try {
      const db = await this.connectToSight(connection, dbname);
      const Sight = await db.model('Sight', SightSchema);
      const sights = await Sight.create(dto);
      await db.close();
      return sights;
    } catch (e) {
      throw new HttpException(
        `Something going wrong ${e.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async connectToSight(connection: Connection, dbname) {
    await connection.close();

    const db = await connection.openUri(process.env.HOST + dbname, {
      useCreateIndex: true,
      useFindAndModify: false,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    return db;
  }
}
