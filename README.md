# Sistema Onix

Plataforma de fichas com Next.js e Supabase. Reestruturação do antigo CRIS, preservado na branch `backup/antes-sistema-onix`.

## Executar

Node 22+, `npm ci`, configure `.env.local` com as duas variáveis de `.env.example`, depois `npm run dev`. Produção: `npm run build`.

## Acesso

Login próprio por e-mail e senha. Só membros autorizados acessam dados. O mestre gerencia jogadores. Cada jogador vê suas fichas; mestre acompanha todas. As permissões são verificadas no banco por RLS.

Catálogos não fazem parte deste repositório nem do bundle público: são carregados do banco somente após autorização. Nunca inserir PDFs, senhas ou chaves secretas no código.

Recursos: atributos, perícias, recursos, dados, poderes, rituais, inventário, descrição e exportação/importação JSON.


Compatibilidade Render e decisões da revisão: veja CONTINUIDADE.md.
