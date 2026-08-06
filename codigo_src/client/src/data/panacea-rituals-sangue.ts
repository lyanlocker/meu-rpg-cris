import type { PanaceaRitual } from "./panacea-rituals";

export const PANACEA_RITUALS_SANGUE: PanaceaRitual[] = [
  {
    "id": "ritual-panacea-17",
    "code": "17",
    "name": "Hemólise Dirigida",
    "element": "sangue",
    "circle": 1,
    "basic": "SANGUE 1º CÍRCULO\nExecução padrão\nAlcance curto\nAlvo 1 ser\nDuração 1 rodada\nResistência Fortitude parcial\nVocê força os fluidos do alvo a se tornarem incompatíveis com o próprio organismo. Vasos se rompem, tecidos\nincham e uma substância escarlate começa a escapar pelos olhos, nariz ou ferimentos existentes.\nO alvo sofre 2d6 pontos de dano de Sangue.\nSe falhar no teste de resistência, no início do próximo turno dele sofre mais 1d6 pontos de dano de Sangue, quando a\nhemólise alcança seu estágio final.\nSe passar, sofre metade do dano inicial e evita o dano posterior.\nO ritual não depende de o alvo possuir sangue convencional. Em seres sem circulação ou anatomia orgânica, o efeito\nse manifesta como rachaduras, vazamentos de lodo, fragmentação ou ruptura de sua estrutura paranormal.",
    "discente": "Discente (+2 PD): Aumenta o dano inicial para 4d6 e o dano posterior para 2d6. Requer 2º círculo.",
    "verdadeira": "Verdadeiro (+5 PD): Muda o alcance para médio. O dano inicial aumenta para 6d6 e o dano posterior para 3d6.\nUm alvo que falhe também fica fraco até o fim do próximo turno dele. Requer 3º círculo e afinidade com Sangue.",
    "application": "Wohpe classifica o efeito como uma reação autoimune paranormal. Durgā considera o ritual uma demonstração\nprática do motivo pelo qual determinadas fórmulas nunca chegaram aos testes clínicos."
  },
  {
    "id": "ritual-panacea-18",
    "code": "18",
    "name": "Tecido de Substituição",
    "element": "sangue",
    "circle": 1,
    "basic": "SANGUE 1º CÍRCULO\nExecução padrão\nAlcance toque\nAlvo 1 ser voluntário\nDuração cena\nUma camada de tecido vermelho cresce sob a pele do alvo. A massa não pertence completamente ao organismo,\nmas tenta imitar músculos, gordura e órgãos para absorver ferimentos em seu lugar.\nO alvo recebe 8 PV temporários.\nEnquanto possuir pelo menos um desses PV temporários:\n• seu deslocamento é reduzido em 3m;\n• na primeira vez em cada rodada que perder esses PV devido a um ataque corpo a corpo, o atacante sofre 1d4 pontos\nde dano de Sangue, desde que esteja adjacente ao alvo.\nOs PV temporários e o tecido desaparecem quando o ritual termina. Conjurar este ritual novamente sobre o mesmo\nser substitui o efeito anterior.",
    "discente": "Discente (+2 PD): Aumenta os PV temporários para 15 e o dano de retaliação para 1d6. Requer 2º círculo.",
    "verdadeira": "Verdadeiro (+5 PD): Aumenta os PV temporários para 25 e o dano de retaliação para 2d6. O tecido se integra\nperfeitamente e não reduz o deslocamento. Requer 3º círculo e afinidade com Sangue.",
    "application": "A matéria foi desenvolvida como substituto emergencial para pacientes que sofreram perda extensa de órgãos.\nEm alguns testes, o tecido continuou crescendo depois que o paciente já havia se recuperado."
  },
  {
    "id": "ritual-panacea-19",
    "code": "19",
    "name": "Transfusão de Emergência",
    "element": "sangue",
    "circle": 1,
    "basic": "SANGUE 1º CÍRCULO\nExecução padrão\nAlcance toque\nAlvo 1 outro ser voluntário\nDuração instantânea\nFilamentos escarlates ligam seu sistema circulatório ao do alvo. Você transfere sangue, vitalidade e parte de sua\nprópria integridade física para estabilizá-lo.\nVocê perde 1d8+2 PV, e o alvo recupera uma quantidade de PV igual à que você efetivamente perdeu.\nEssa perda:\n• ignora qualquer resistência;\n• não pode ser reduzida ou evitada;\n• não pode deixá-lo com menos de 1 PV.\nSe você não possuir PV suficientes para sofrer toda a perda, perde apenas o necessário para permanecer com 1 PV,\ne o alvo recupera essa quantidade.\nO ritual não pode elevar o alvo acima de seus PV máximos.",
    "discente": "Discente (+2 PD): Muda o alcance para curto e os alvos para 2 seres voluntários. Escolha um deles como doador\ne outro como receptor. O doador perde 2d8+5 PV, e o receptor recupera o mesmo valor. Requer 2º círculo.",
    "verdadeira": "Verdadeiro (+5 PD): Escolha um doador e até três receptores em alcance curto. O doador perde 4d8+10 PV,\nrespeitando o limite mínimo de 1 PV. Distribua a quantidade efetivamente perdida entre os receptores como\ndesejar. Requer 3º círculo e afinidade com Sangue.",
    "application": "O procedimento é usado em operações nas quais não existem bolsas de sangue compatíveis, médicos\ndisponíveis ou tempo suficiente para discutir o consentimento do doador."
  },
  {
    "id": "ritual-panacea-20",
    "code": "20",
    "name": "Resposta Inflamatória Programada",
    "element": "sangue",
    "circle": 1,
    "basic": "SANGUE 1º CÍRCULO\nExecução padrão\nAlcance curto\nAlvo 1 ser\nDuração 1 rodada\nResistência Fortitude anula\nVocê induz uma resposta inflamatória súbita e descontrolada. Articulações incham, músculos endurecem e cada\nmovimento provoca uma dor pulsante.\nSe falhar no teste de resistência, até o início do seu próximo turno o alvo sofre:\n• -2 em testes de ataque;\n• -3m de deslocamento.\nAs penalidades não se acumulam com outras utilizações deste ritual.",
    "discente": "Discente (+2 PD): Muda a duração para cena. No fim de cada turno, o alvo pode repetir o teste de Fortitude para\nencerrar o efeito. Requer 2º círculo.",
    "verdadeira": "Verdadeiro (+5 PD): Muda a área para uma esfera de 6m de raio em alcance médio e afeta seres escolhidos. As\npenalidades aumentam para -5 em testes de ataque e -6m de deslocamento. Um ser que falhe também não pode\nrealizar reações por uma rodada. Requer 4º círculo e afinidade com Sangue.",
    "application": "A fórmula foi criada em Wohpe como uma maneira de testar doenças inflamatórias sem precisar esperar que o\npaciente desenvolvesse sintomas naturalmente."
  },
  {
    "id": "ritual-panacea-21",
    "code": "21",
    "name": "Enxerto Auxiliar",
    "element": "sangue",
    "circle": 1,
    "basic": "SANGUE 1º CÍRCULO\nExecução padrão\nAlcance toque\nAlvo 1 ser voluntário\nDuração cena\nUm membro rudimentar cresce no torso, ombro ou costas do alvo. Ele pode se parecer com um braço humano\nincompleto, uma garra, um tentáculo muscular ou um conjunto de dedos unidos por membranas.\nO membro pode carregar um objeto de até 1 espaço.\nUma vez por rodada, o alvo pode utilizá-lo como uma ação livre para realizar uma interação simples, como:\n• sacar ou guardar um item;\n• pegar ou largar um objeto;\n• abrir uma porta destrancada;\n• pressionar um botão;\n• segurar uma lanterna;\n• conectar um cabo;\n• manter componentes ritualísticos em mãos.\nO enxerto não pode:\n• realizar ataques;\n• empunhar armas;\n• utilizar itens consumíveis;\n• executar gestos ritualísticos;\n• realizar testes de perícia de forma independente;\n• fornecer ações adicionais.",
    "discente": "Discente (+2 PD): Cria dois membros, que podem carregar até 2 espaços no total. O alvo pode realizar até duas\ninterações simples por rodada, cada uma com um membro diferente. Requer 2º círculo.",
    "verdadeira": "Verdadeiro (+5 PD): Os membros tornam-se completamente articulados. Uma vez por rodada, um deles pode\nutilizar um item que normalmente exija uma ação de movimento, sem gastar essa ação. Ele ainda não pode atacar\nou conceder ações adicionais. Requer 3º círculo e afinidade com Sangue.",
    "application": "Sumé originalmente desenvolveu o enxerto para animais incapazes de manipular equipamentos laboratoriais.\nOs primeiros testes em seres humanos não faziam parte do projeto autorizado."
  },
  {
    "id": "ritual-panacea-22",
    "code": "22",
    "name": "Hemocultura de Contenção",
    "element": "sangue",
    "circle": 1,
    "basic": "SANGUE 1º CÍRCULO\nExecução padrão\nAlcance curto\nEfeito hemocultura em um espaço de 1,5m\nDuração cena\nResistência Reflexos anula\nVocê deposita uma massa de sangue espesso no chão. Em poucos segundos, ela desenvolve fibras musculares,\ndentes vestigiais e estruturas semelhantes a veias.\nA hemocultura possui:\n• Defesa 10;\n• 10 PV;\n• tamanho Pequeno;\n• imunidade a condições mentais.\nNa primeira vez em cada rodada que um ser entra ou começa seu turno no espaço ocupado pela hemocultura, deve\nfazer um teste de Reflexos.\nSe falhar, fica agarrado até o início de seu próximo turno. Ele pode gastar uma ação de movimento e fazer um teste\nde Atletismo ou Acrobacia contra a DT de seus rituais para escapar antecipadamente.\nA hemocultura consegue manter apenas um ser agarrado por vez. Enquanto estiver segurando alguém, não tenta\nagarrar outros seres.\nEla não distingue aliados de inimigos.",
    "discente": "Discente (+2 PD): A hemocultura ocupa uma área de 3m de raio, possui Defesa 15 e 30 PV e pode manter até três\nseres agarrados simultaneamente. Requer 2º círculo.",
    "verdadeira": "Verdadeiro (+5 PD): Aumenta a área para 6m de raio. Você pode escolher seres que serão ignorados pela\nhemocultura. Um ser que comece o turno agarrado também sofre 2d6 pontos de dano de Sangue. Requer 3º\ncírculo e afinidade com Sangue.",
    "application": "Hygieia utiliza colônias semelhantes para bloquear corredores durante quebras de contenção. Depois de cada\nincidente, elas precisam ser alimentadas para aceitar retornar aos recipientes."
  },
  {
    "id": "ritual-panacea-23",
    "code": "23",
    "name": "Pulso Hemodinâmico",
    "element": "sangue",
    "circle": 1,
    "basic": "SANGUE 1º CÍRCULO\nExecução movimento\nAlcance pessoal\nAlvo você\nDuração cena\nSua pele se torna extremamente sensível a alterações de temperatura, pressão, respiração e circulação. Você passa\na sentir o movimento dos fluidos dentro dos corpos próximos.\nVocê recebe +5 em Percepção para encontrar seres que possuam circulação, fluidos orgânicos ou estruturas\nequivalentes.\nAlém disso, enquanto esses seres estiverem em alcance curto:\n• você sabe a direção e a distância aproximada deles;\n• escuridão comum, fumaça e névoa não impõem penalidades para encontrá-los;\n• você reconhece imediatamente se um deles está machucado.\nO ritual não revela a posição exata de seres escondidos ou invisíveis, não permite atravessar cobertura total e não\ndetecta objetos ou seres completamente desprovidos de anatomia orgânica.",
    "discente": "Discente (+2 PD): Aumenta o alcance de detecção para médio. Se possuir linha de efeito até um ser, você sabe o\nespaço exato ocupado por ele, e esse ser não recebe benefícios por estar escondido contra você. Requer 2º\ncírculo.",
    "verdadeira": "Verdadeiro (+5 PD): Aumenta o alcance para longo. Você pode sentir seres através de até 1,5m de material sólido\ne ignora os benefícios de invisibilidade contra seres detectados. Barreiras mais espessas ainda bloqueiam o ritual.\nRequer 4º círculo e afinidade com Sangue.",
    "application": "O protocolo reproduz os sentidos de algumas criaturas de Sangue, que detectam presenças pela dor causada\npor alterações sutis no ar. Os pesquisadores descobriram que retirar o sentido depois do teste é muito mais\ndifícil do que concedê-lo."
  },
  {
    "id": "ritual-panacea-24",
    "code": "24",
    "name": "Regulador Límbico",
    "element": "sangue",
    "circle": 1,
    "basic": "SANGUE 1º CÍRCULO\nExecução padrão\nAlcance curto\nAlvo 1 ser\nDuração cena\nResistência Vontade anula, apenas para alvo involuntário\nVocê altera a produção de adrenalina, cortisol e outras substâncias relacionadas a respostas emocionais extremas.\nEscolha um dos protocolos.\nProtocolo de confronto\nO alvo entra em um estado de agressividade controlada.\nEle recebe:\n• +2 em testes de ataque corpo a corpo;\n• +2 em Intimidação;\n• -2 na Defesa.\nProtocolo de evasão\nO organismo do alvo interpreta todas as ameaças como uma ordem para fugir.\nEle recebe:\n• +3m de deslocamento;\n• +2 em Reflexos;\n• -2 em testes de ataque.\nUm alvo involuntário pode repetir o teste de Vontade no fim de cada turno. Se passar, o ritual termina.\nUm ser só pode estar sob efeito de um Regulador Límbico por vez. Uma nova aplicação substitui a anterior.",
    "discente": "Discente (+2 PD): No protocolo de confronto, os bônus aumentam para +5 e a penalidade na Defesa para -5. No\nprotocolo de evasão, o deslocamento aumenta em +6m, o bônus em Reflexos aumenta para +5 e a penalidade em\nataques aumenta para -5. Requer 2º círculo.",
    "verdadeira": "Verdadeiro (+5 PD): Muda o alvo para até cinco seres voluntários. Cada alvo pode escolher seu protocolo no início\nde cada turno, recebendo os valores da versão Discente. Requer 4º círculo e afinidade com Sangue.",
    "application": "Durgā apresenta o regulador como um medicamento para situações de emergência. O setor de segurança o\nutiliza como um método para decidir quais funcionários lutarão e quais correrão durante um incidente."
  }
];
