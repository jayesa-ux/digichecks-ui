import { EventTypes } from './evet-types';

export interface ToastEvent {
    type: EventTypes;
    title: string;
    message: string;
    delay: number;
}
