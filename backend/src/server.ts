import { app } from './app';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

app.listen(port, () => {
  process.stdout.write(`PDF Guru backend listening on port ${port}\n`);
});
