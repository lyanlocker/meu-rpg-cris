# Sistema oficial de NEX

Esta implementação usa a progressão padrão do Livro de Regras de Ordem Paranormal RPG:

- NEX 5% equivale ao nível 1.
- Cada avanço segue os marcos de 5% até 95%; o último avanço é para 99%.
- O limite de PE vai de 1 a 20.
- PV, PE e SAN aumentam conforme a classe, Vigor e Presença.
- Os benefícios de classe de cada marco são mostrados no painel de progressão.

## Acesso de mestre e jogador

O sistema segue o acesso já utilizado no site:

- o link normal mostra os controles do mestre;
- o link com `?mode=player` mostra a progressão somente para consulta;
- no modo jogador, a classe e o botão de avanço de NEX ficam bloqueados.

Não é necessário configurar uma nova variável de ambiente para o NEX.

## Atualização automática do banco

Foram adicionadas as colunas `character_class`, `pe_actual`, `pe_max` e `pe_limit`.
O script `prebuild` executa `npm run db:push` antes do build, usando a `DATABASE_URL` já configurada no Render para atualizar o banco Neon.

## Agentes já existentes

As estatísticas já gravadas não são recalculadas automaticamente, para não apagar bônus de origem, poderes ou ajustes da campanha. A partir do próximo avanço, os acréscimos passam a seguir a classe escolhida no painel.

Em NEX 5%, ao trocar de classe, o mestre pode escolher recalcular PV, PE e SAN iniciais conforme a nova classe.

## Observação de acesso

O bloqueio segue o mesmo modelo já usado pelo site: os controles ficam indisponíveis no modo jogador. Ele não adiciona um segundo sistema de login ou senha.
