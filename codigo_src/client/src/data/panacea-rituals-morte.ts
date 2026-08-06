import type { PanaceaRitual } from "./panacea-rituals-types";

export const PANACEA_RITUALS_MORTE: PanaceaRitual[] = [
  {
    "id": "meia-vida-organica",
    "number": 25,
    "name": "Meia-Vida Orgânica",
    "element": "morte",
    "circle": 1,
    "base": "Execução padrão\nAlcance curto\nAlvo 1 ser\nDuração 1 rodada\nResistência Fortitude parcial\nVocê introduz uma espiral de Morte no organismo do alvo. A manifestação não destrói seus tecidos imediatamente; ela divide a deterioração em dois momentos temporais distintos.\nO alvo sofre 1d8+1 pontos de dano de Morte.\nSe falhar no teste de resistência, no início do próximo turno dele sofre novamente 1d8+1 pontos de dano de Morte.\nApós esse segundo dano, o ritual termina.\nSe passar na resistência, sofre metade do dano inicial e evita o dano posterior.\nEntre as duas manifestações, partes do alvo parecem envelhecer e rejuvenescer alternadamente. Ferimentos fecham, apodrecem e voltam a abrir em ciclos de poucos segundos.",
    "discente": "Discente (+2 PD): Aumenta cada instância de dano para 2d8+2. Se o alvo falhar, também fica vulnerável até sofrer o dano posterior. Requer 2º círculo.",
    "verdadeiro": "Verdadeiro (+5 PD): Muda o alcance para médio e aumenta cada instância para 3d8+3. Se o alvo falhar, fica fraco até o fim do próximo turno dele. Requer 3º círculo e afinidade com Morte.",
    "application": "Wohpe utiliza o protocolo para observar doenças cuja progressão normalmente levaria semanas. Durgā o emprega para calcular quanto tempo um organismo suporta determinada fórmula antes de entrar em colapso."
  },
  {
    "id": "protocolo-de-latencia-celular",
    "number": 26,
    "name": "Protocolo de Latência Celular",
    "element": "morte",
    "circle": 1,
    "base": "Execução padrão\nAlcance toque\nAlvo 1 ser voluntário\nDuração cena\nLodo preto percorre as veias do alvo e reduz drasticamente a passagem de tempo em uma parte específica de seu organismo.\nEscolha um efeito de origem biológica que esteja afetando o alvo, como:\n• doença;\n• droga;\n• veneno;\n• hemorragia;\n• intoxicação;\n• efeito químico contínuo.\nEnquanto o ritual permanecer ativo, o efeito escolhido fica suspenso:\n• não causa dano periódico;\n• não aplica novos sintomas;\n• não exige testes periódicos;\n• sua duração não avança;\n• não pode se agravar ou ser transmitido pelo alvo.\nO efeito não é curado. Quando o ritual termina, ele retorna exatamente ao estágio em que estava.\nEnquanto estiver em latência, o alvo não pode recuperar PV, pois seus processos regenerativos também estão desacelerados.\nEste ritual não suspende a condição morrendo, ferimentos comuns, maldições, perda de PD ou efeitos cuja origem seja exclusivamente mental.",
    "discente": "Discente (+2 PD): Pode suspender até dois efeitos. O alvo também pode recuperar PV normalmente durante a latência. Requer 2º círculo.",
    "verdadeiro": "Verdadeiro (+5 PD): Muda o alcance para curto e o alvo para até cinco seres voluntários. Em cada alvo, você pode suspender todos os efeitos biológicos válidos presentes. Requer 3º círculo e afinidade com Morte.",
    "application": "O protocolo permite transportar pacientes e cobaias por longas distâncias sem que suas condições se agravem. Alguns espécimes foram mantidos em latência durante tanto tempo que os funcionários responsáveis morreram antes que o tratamento fosse retomado."
  },
  {
    "id": "ponto-de-retorno",
    "number": 27,
    "name": "Ponto de Retorno",
    "element": "morte",
    "circle": 1,
    "base": "Execução padrão\nAlcance curto\nAlvo 1 ser\nDuração 1 rodada\nResistência Fortitude anula\nVocê grava uma espiral no espaço ocupado pelo alvo. Para a Morte, aquele ponto se torna o único momento válido de sua trajetória.\nNa primeira vez antes do início do seu próximo turno que o alvo terminar um deslocamento a mais de 3m do espaço marcado, ele é imediatamente arrastado de volta.\nO alvo retorna ao espaço original ou ao espaço desocupado mais próximo e seu deslocamento termina. O ritual então se encerra.\nO retorno:\n• não desfaz ataques ou ações realizados;\n• não recupera recursos gastos;\n• não restitui PV;\n• não reabre portas ou desfaz interações;\n• não provoca reações;\n• não funciona se o espaço de retorno estiver completamente isolado por uma barreira que impeça linha de efeito.\nO ritual pode ser ativado por deslocamento voluntário ou involuntário.",
    "discente": "Discente (+2 PD): Muda a duração para cena. Sempre que terminar um deslocamento a mais de 3m do ponto, o alvo pode fazer um novo teste de Fortitude. Se falhar, retorna; se passar, o ritual termina. Requer 2º círculo.",
    "verdadeiro": "Verdadeiro (+5 PD): Muda o alvo para até cinco seres e a distância permitida para 1,5m. Cada alvo possui seu próprio ponto de retorno. Requer 3º círculo e afinidade com Morte.",
    "application": "Hygieia utiliza o ritual como uma contenção invisível. O espécime acredita que conseguiu escapar até perceber que está atravessando o mesmo corredor pela sexta vez."
  },
  {
    "id": "campo-de-inercia-clinica",
    "number": 28,
    "name": "Campo de Inércia Clínica",
    "element": "morte",
    "circle": 1,
    "base": "Execução padrão\nAlcance curto\nÁrea esfera com 3m de raio\nDuração sustentada\nResistência Fortitude parcial\nVocê cria uma área preenchida por cinzas imóveis e gotas de Lodo que permanecem suspensas no ar.\nQuando um ser entra na área pela primeira vez em uma rodada ou começa seu turno nela, deve fazer um teste de Fortitude.\nSe falhar, seu deslocamento é reduzido em 6m até o início do próximo turno dele.\nSe passar, seu deslocamento é reduzido em 3m durante o mesmo período.\nEssa redução não pode diminuir o deslocamento do ser para menos de 1,5m. O ritual afeta aliados e inimigos igualmente.\nProjéteis, objetos arremessados e movimentos puramente involuntários não são reduzidos. O campo interfere no tempo empregado pelo organismo para iniciar e concluir seus próprios movimentos.",
    "discente": "Discente (+2 PD): Aumenta o raio para 6m. Ao conjurar, escolha um número de seres igual à sua Presença; eles são imunes ao campo. Requer 2º círculo.",
    "verdadeiro": "Verdadeiro (+5 PD): Muda a duração para cena e não precisa ser sustentado. Um ser que falhe também não pode realizar reações até o início do próximo turno dele. Requer 3º círculo e afinidade com Morte.",
    "application": "O campo foi desenvolvido para salas de cirurgia envolvendo espécimes extremamente rápidos. A equipe médica trabalha normalmente; o paciente leva vários segundos para concluir até mesmo um espasmo."
  },
  {
    "id": "lodo-conservante",
    "number": 29,
    "name": "Lodo Conservante",
    "element": "morte",
    "circle": 1,
    "base": "Execução completa\nAlcance toque\nAlvo 1 cadáver, amostra biológica ou objeto orgânico de até 2 espaços\nDuração 1 dia\nVocê recobre o alvo com uma película fina de Lodo preto. O tempo deixa de agir sobre ele.\nEnquanto o ritual permanecer ativo, o alvo:\n• não apodrece;\n• não resseca;\n• não fermenta;\n• não é consumido por microrganismos comuns;\n• preserva impressões digitais, ferimentos e resíduos;\n• mantém a temperatura e o estado físico que possuía na conjuração;\n• não pode transmitir doenças ou venenos por contato passivo.\nO ritual não restaura matéria já deteriorada e não impede que o alvo seja destruído por dano, fogo ou manipulação física.\nUma amostra retirada do alvo após a conjuração não permanece preservada.",
    "discente": "Discente (+2 PD): Muda a duração para uma semana e o alvo para até cinco cadáveres, amostras ou objetos orgânicos em alcance curto. Requer 2º círculo.",
    "verdadeiro": "Verdadeiro (+5 PD): Muda o alvo para 1 ser voluntário e a duração para sustentada. O alvo fica inconsciente e completamente suspenso no tempo: não envelhece, respira, sente fome ou sofre progressão de efeitos biológicos. Ele não pode agir nem recuperar PV e retorna ao estado normal quando o ritual termina. Requer 3º círculo e afinidade com Morte.",
    "application": "Sumé utiliza o ritual para transportar espécies que não sobreviveriam fora de ambientes controlados. Durgā o emprega para conservar órgãos e reagentes que não podem ser congelados por métodos comuns. Os recipientes costumam trazer a inscrição: “A AMOSTRA NÃO ESTÁ MORTA. APENAS NÃO ESTÁ PASSANDO PELO TEMPO.”"
  },
  {
    "id": "senescencia-instrumental",
    "number": 30,
    "name": "Senescência Instrumental",
    "element": "morte",
    "circle": 1,
    "base": "Execução padrão\nAlcance curto\nAlvo 1 objeto não paranormal de tamanho Pequeno ou menor\nDuração cena\nResistência Reflexos anula, veja o texto\nVocê acelera anos de desgaste no objeto. Metal enferruja, madeira resseca, tecidos perdem elasticidade e mecanismos acumulam décadas de uso em poucos segundos.\nEnquanto o ritual permanecer ativo:\n• testes realizados utilizando o objeto sofrem -2;\n• se o objeto fornecer bônus na Defesa, esse bônus é reduzido em 2, até o mínimo de 0;\n• fechaduras, ferramentas e mecanismos tornam-se barulhentos e imprecisos;\n• registros físicos, papéis e embalagens ficam frágeis, mas ainda legíveis;\n• o objeto continua funcional e não é considerado quebrado.\nSe estiver sendo carregado, vestido ou empunhado por um ser involuntário, ele pode fazer um teste de Reflexos para proteger o objeto e anular o ritual.\nO objeto retorna ao estado anterior quando o ritual termina. O envelhecimento produzido é temporal, não permanente.",
    "discente": "Discente (+2 PD): Muda o tamanho máximo para Médio e a penalidade para -5. Requer 2º círculo.",
    "verdadeiro": "Verdadeiro (+5 PD): Muda o alvo para até cinco objetos. Objetos cujos portadores falhem ficam quebrados até o fim da cena, em vez de receberem apenas as penalidades. Requer 3º círculo e afinidade com Morte.",
    "application": "A Panacea emprega o ritual para inutilizar armas, proteções, ferramentas de invasão e recipientes roubados sem comprometer permanentemente o material de pesquisa. Maximón mantém cópias de segurança porque descobriu que o ritual também funciona em mídias físicas."
  },
  {
    "id": "instante-emprestado",
    "number": 31,
    "name": "Instante Emprestado",
    "element": "morte",
    "circle": 1,
    "base": "Execução reação\nAlcance curto\nAlvo 1 ser voluntário\nDuração instantânea\nGatilho o alvo é escolhido por um ataque ou realiza um teste de Reflexos\nVocê retira uma fração de segundo do futuro do alvo e a insere no momento atual.\nO alvo recebe +2 na Defesa contra o ataque que ativou o ritual ou +2 no teste de Reflexos, conforme o gatilho.\nDepois que o ataque ou efeito for resolvido, o alvo pode se deslocar 1,5m. Esse deslocamento não provoca reações.\nO tempo emprestado precisa ser devolvido. Até o fim do próximo turno do alvo, seu deslocamento é reduzido em 3m.\nVocê deve conjurar o ritual depois que o alvo for escolhido, mas antes da rolagem correspondente.",
    "discente": "Discente (+2 PD): O bônus aumenta para +5, e o alvo pode se deslocar até 3m após a resolução. Requer 2º círculo.",
    "verdadeiro": "Verdadeiro (+5 PD): O alvo se desloca até metade de seu deslocamento antes da resolução. Se esse movimento torná-lo um alvo inválido para o ataque ou retirar seu corpo da área do efeito, ele não é afetado. A redução posterior de deslocamento não acontece. Requer 3º círculo e afinidade com Morte.",
    "application": "O protocolo foi criado para evitar acidentes laboratoriais. O funcionário escapa antes que o recipiente exploda, mas passa os segundos seguintes sentindo o corpo cobrar um tempo que ainda não viveu."
  },
  {
    "id": "autopsia-cronologica",
    "number": 32,
    "name": "Autópsia Cronológica",
    "element": "morte",
    "circle": 1,
    "base": "Execução completa\nAlcance toque\nAlvo 1 cadáver\nDuração cena\nVocê faz o cadáver retroceder temporariamente ao estado físico que possuía imediatamente após a morte.\nDecomposição, danos posteriores, mutilações realizadas após o óbito e alterações causadas pelo ambiente desaparecem sob uma camada de Lodo. Partes ausentes são recriadas apenas como reproduções temporais e não podem ser retiradas, utilizadas ou preservadas.\nEnquanto o ritual durar, você recebe +5 em Medicina e Investigação para examinar o cadáver.\nAo completar o exame, pode descobrir duas das seguintes informações:\n• há quanto tempo ocorreu a morte, de forma aproximada;\n• qual ferimento ou efeito foi diretamente responsável pela morte;\n• que tipos de dano atingiram o corpo;\n• se havia doença, droga, veneno ou substância química presente;\n• se um efeito paranormal contribuiu para a morte;\n• se o corpo foi movido ou alterado depois do óbito;\n• se determinadas lesões ocorreram antes ou depois da morte.\nO cadáver não recupera consciência, não fala e não revela lembranças. Quando o ritual termina, retorna ao estado atual.",
    "discente": "Discente (+2 PD): Você pode escolher um momento ocorrido até 24 horas antes da morte. Durante seis segundos, o corpo reproduz os movimentos físicos que realizava naquele instante, sem sons, pensamentos ou imagens do ambiente. Requer 2º círculo.",
    "verdadeiro": "Verdadeiro (+5 PD): Pode escolher qualquer momento ocorrido até sete dias antes da morte e observar até um minuto de seus movimentos. Silhuetas de Lodo representam seres e objetos que estavam em contato físico direto com o alvo. Requer 3º círculo e afinidade com Morte.",
    "application": "Hygieia utiliza o ritual após quebras de contenção. Wohpe o emprega para determinar em que estágio uma infecção se tornou fatal. Sumé o usa para descobrir qual parte de um ecossistema matou um espécime raro. O cadáver não responde perguntas. Mas seu tempo ainda pode ser interrogado."
  }
];
