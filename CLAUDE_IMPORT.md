# Pacote de importação do Fenix

Este pacote reúne o código do Fenix e o catálogo estruturado usado pelo site.

## O que importar

- `lib/data/book-catalog.json`: catálogo principal com 2.559 registros.
- `lib/data/character-options.json`: origens, trilhas e opções de criação.
- `lib/books.ts`, `lib/catalog.ts` e `components/library.tsx`: lógica e interface da biblioteca.
- `catalog-manifest.json`: fontes, tipos e contagens do catálogo.

Cada registro do catálogo preserva, quando disponível, `source`, `bookId`, `page`, `kind`, `name`, `notes` e requisitos. Não invente texto ausente: mantenha o registro como incompleto e sinalize-o para revisão.

## Cobertura atual

O catálogo contém material estruturado de seis fontes. Há 933 poderes, 1.000 rituais, 111 armas e 515 itens no conjunto total. O manifesto detalha a divisão por fonte.

## Importante

Este pacote é uma base de dados de importação, não uma declaração de que cada página dos livros foi auditada integralmente. Antes de publicar, compare os registros com os PDFs originais e corrija duplicações, páginas ou campos ausentes. Não substitua conteúdo confirmado por suposições.

## Executar o site

```bash
npm install
npm run dev
```

