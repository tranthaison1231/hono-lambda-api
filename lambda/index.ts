import { Hono } from 'hono';
import { handle } from 'hono/aws-lambda';

const app = new Hono();

app.get('/', (c) =>
  c.json(
    {
      message: 'Hello, world!',
    },
    200
  )
);

export const handler: any = handle(app);
