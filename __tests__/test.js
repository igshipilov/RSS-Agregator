import { promises as fs } from 'fs';
import path from 'path';
import init from '../src/init';

// beforeEach(async () => {
//   const pathToHtml = path.resolve(__dirname, '__fixtures__/index.html');
//   const html = await fs.readFile(pathToHtml, 'utf8');
//   document.body.innerHTML = html;
// });

test('init', () => {
  init();
  expect(true).toBeDefined();
});


/*

TEST CASES

- Изначальное состояние поля

- Отправлен корректный url:
  - Подпись:
    -- имеет класс '.text-success'
    -- не имеет класса '.text-danger'
    -- содержит текст: 'RSS успешно загружен'
  - input:
    -- очищен
    -- фокус на нём

- Отправлен некорректный url:
  - Подпись:
    -- не имеет класса '.text-success'
    -- имеет класс '.text-danger'
    -- содержит текст: 'Ссылка должна быть валидным URL'
  - input:
    -- содержит введённый юзером текст

- Отправлен уже существующий url:
  - Подпись:
    -- не имеет класса '.text-success'
    -- имеет класс '.text-danger'
    -- содержит текст: 'RSS уже существует'
  - input:
    -- содержит введённый юзером текст



*/