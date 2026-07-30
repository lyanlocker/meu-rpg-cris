# Sistema oficial de NEX

Esta implementação usa a progressão padrão do Livro de Regras de Ordem Paranormal RPG:

- NEX 5% equivale ao nível 1.
- Cada avanço segue os marcos de 5% até 95%; o último avanço é para 99%.
- O limite de PE vai de 1 a 20.
- PV, PE e SAN aumentam conforme a classe, Vigor e Presença.
- Os benefícios de classe de cada marco são mostrados no painel de progressão.

## Configuração obrigatória

Defina uma variável de ambiente no servidor:

```text
MASTER_KEY=um-codigo-secreto-forte
```

O código não é enviado aos jogadores. O mestre o informa no navegador quando tenta alterar a classe ou avançar o NEX, e ele fica guardado apenas na sessão daquela aba.

## Atualização do banco

Foram adicionadas as colunas `character_class`, `pe_actual`, `pe_max` e `pe_limit`.
Depois de publicar a versão, execute:

```bash
npm run db:push
```

## Agentes já existentes

As estatísticas já gravadas não são recalculadas, para não apagar bônus de origem, poderes ou ajustes da campanha. A partir do próximo avanço, os acréscimos passam a seguir a classe escolhida no painel.
