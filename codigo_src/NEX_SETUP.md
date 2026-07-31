# Sistema de NEX com Pontos de Determinação

Esta implementação combina a progressão padrão de NEX com a regra opcional **Jogando sem Sanidade**, de *Sobrevivendo ao Horror*:

- NEX 5% equivale ao nível 1.
- Cada avanço segue os marcos de 5% até 95%; o último avanço é para 99%.
- PE e SAN não são usados como reservas separadas; ambos são representados por Pontos de Determinação (PD).
- O limite de gasto vai de 1 a 20 e é apresentado na interface como limite de PD.
- PV e PD aumentam conforme a classe, Vigor e Presença.
- Os benefícios de classe de cada marco são mostrados no painel de progressão.

## Progressão de PD

- Combatente: começa com 6 + PRE PD e recebe 3 + PRE por novo NEX.
- Especialista: começa com 8 + PRE PD e recebe 4 + PRE por novo NEX.
- Ocultista: começa com 10 + PRE PD e recebe 5 + PRE por novo NEX.

## Acesso de mestre e jogador

O sistema segue o acesso já utilizado no site:

- o link normal mostra os controles do mestre;
- o link com `?mode=player` mostra a progressão somente para consulta;
- no modo jogador, a classe e o botão de avanço de NEX ficam bloqueados.

## Banco e compatibilidade

As colunas antigas de PE continuam no banco para compatibilidade, mas não são usadas pela interface nem pela progressão. O campo técnico `pe_limit` guarda o limite de gasto exibido como **Limite de PD**.

As estatísticas já gravadas não são recalculadas automaticamente. Quando uma ficha com PD personalizados avança, o sistema preserva o valor atual e acrescenta apenas o ganho do novo NEX.

Em NEX 5%, ao trocar de classe, o mestre pode optar por recalcular os valores iniciais de PV e PD ou manter os valores personalizados.
