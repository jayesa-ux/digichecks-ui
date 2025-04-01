import { CityHall } from './cityHall.model';
import { ConstructionType } from './constructionType.model';

export interface Construction {
    _id?: string;
    code?: string;
    name: string;
    constructionType: ConstructionType[];
    shortDescription: string; // we use this field to set area o length
    largeDescription: string;
    country: string;
    city: CityHall[];
    createDate: Date;
    estimatedFinish: Date;
    status: string;
    images: string[];
    latitude: number;
    longitude: number;
    group: string[];
}
