import { AllMiddlewareArgs } from '@slack/bolt/dist/types/middleware';

export type WithMiddleware<T> = AllMiddlewareArgs & T;
