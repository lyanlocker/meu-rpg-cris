# Sistema Onix

Plataforma de fichas com Next.js e Supabase. Reestruturação do antigo CRIS, preservado na branch `backup/antes-sistema-onix`.

## Executar

Node 22+, `npm ci`, configure `.env.local` com as duas variáveis de `.env.example`, depois `npm run dev`. Produção: `npm run build`.

## Acesso

Os jogadores entram com um identificador e uma senha criados pelo mestre; não há cadastro público nem necessidade de e-mail pessoal. O e-mail técnico usado internamente pelo Supabase não aparece na interface. O mestre também pode trocar senhas e revogar acessos. Cada jogador vê suas fichas; o mestre acompanha todas. As permissões são verificadas no banco por RLS e a criação de contas ocorre em uma Edge Function autenticada.

Catálogos não fazem parte deste repositório nem do bundle público: são carregados do banco somente após autorização. Nunca inserir PDFs, senhas ou chaves secretas no código.

Recursos: atributos, perícias, recursos, dados, poderes, rituais, inventário, descrição, exportação/importação JSON e painel de rolagens simultâneas em tempo real para o mestre.


Compatibilidade Render e decisões da revisão: veja CONTINUIDADE.md.
