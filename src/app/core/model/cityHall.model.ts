import { Country } from './country.model';

export interface CityHall {
    _id: string;
    name: string;
    description: string;
    latitude: number;
    longitude: number;
    country: Country[];
}
