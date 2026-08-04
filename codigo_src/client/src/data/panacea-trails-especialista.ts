import type { PanaceaTrail } from "./panacea-types";

export const PANACEA_ESPECIALISTA_TRAILS: PanaceaTrail[] = [
  {
    "id": "bioquimico-de-campo",
    "name": "Bioquímico de Campo",
    "class": "especialista",
    "description": "Você foi treinado em Durgā para produzir compostos experimentais fora de um laboratório. Suas fórmulas são instáveis, possuem efeitos colaterais preocupantes e não foram aprovadas por nenhuma agência sanitária. Para a Panacea, isso significa apenas que ainda estão em fase de testes.",
    "milestones": [
      {
        "nex": 10,
        "name": "Estojo de ensaio",
        "description": "Durante cada interlúdio, você prepara um número de doses experimentais igual ao seu Intelecto, mínimo 2.\n\nAs doses:\n\n• não possuem categoria;\n• não ocupam espaço;\n• perdem a eficácia no próximo interlúdio;\n• devem ter sua fórmula escolhida durante a preparação.\n\nCom uma ação de movimento e 1 PD, você administra uma dose em si mesmo ou em uma criatura voluntária adjacente.\n\nUma criatura só pode receber uma dose desta habilidade por rodada.\n\nFórmula hemostática\nO alvo recebe 1d8 + seu Intelecto em PV temporários até o fim da cena.\n\nPV temporários de várias aplicações não se acumulam.\n\nFórmula sináptica\nO alvo recebe +2 no próximo teste de perícia que fizer até o fim do próximo turno.\n\nFórmula antagonista\nO alvo recebe +5 no próximo teste de resistência que fizer até o fim do próximo turno."
      },
      {
        "nex": 40,
        "name": "Fórmula estável",
        "description": "Você passa a preparar um número de doses igual a 2 + seu Intelecto.\n\nUma vez por rodada, pode administrar uma dose como uma ação livre, ainda pagando seu custo de 1 PD. Além disso, as fórmulas são aprimoradas:\n\n• Hemostática: fornece 2d8 + Intelecto em PV temporários.\n• Sináptica: fornece +5 no próximo teste.\n• Antagonista: além do bônus, permite que o alvo repita imediatamente um teste contra uma condição que normalmente permita novos testes.\n\nVocê pode utilizar um injetor pneumático para administrar doses em criaturas voluntárias em alcance curto."
      },
      {
        "nex": 65,
        "name": "Reação adversa",
        "description": "Você aprendeu que as mesmas substâncias que estabilizam um organismo podem destruir outro.\n\nCom uma ação padrão e 3 PD, você dispara uma dose contra uma criatura em alcance curto. Faça um ataque com Pontaria contra a Defesa do alvo.\n\nCaso acerte, o alvo faz um teste de Fortitude contra sua DT de Intelecto. Se falhar, escolha o efeito conforme a fórmula utilizada:\n\n• Hemostática: o sangue coagula violentamente. O alvo sofre 4d6 de dano químico e fica fraco por uma rodada.\n• Sináptica: o sistema nervoso entra em colapso. O alvo fica lento e não pode realizar reações por uma rodada.\n• Antagonista: o organismo começa a rejeitar a si próprio. O alvo fica vulnerável e não pode recuperar PV por uma rodada.\n\nSe passar, sofre apenas metade do dano químico, caso exista, e evita as condições."
      },
      {
        "nex": 99,
        "name": "Panaceia verdadeira",
        "description": "Uma vez por missão, durante um interlúdio, você pode produzir uma única dose da fórmula que deu nome à empresa.\n\nCom uma ação padrão e 8 PD, você administra a fórmula em uma criatura voluntária adjacente. Ela:\n\n• recupera 10d8 + seu Intelecto em PV;\n• encerra todas as condições negativas que esteja sofrendo;\n• recebe 30 PV temporários;\n• recebe +5 em testes de resistência até o fim da cena.\n\nNa primeira vez durante o efeito que seria reduzida a 0 PV, permanece com 1 PV. Depois disso, os PV temporários e o bônus em resistência são encerrados.\n\nApós a cena, a criatura fica fatigada até o próximo interlúdio.\n\nO medicamento funciona.\n\nOs pesquisadores ainda não descobriram por que o paciente começa a sonhar com lugares onde nunca esteve."
      }
    ]
  },
  {
    "id": "engenheiro-de-contencao",
    "name": "Engenheiro de Contenção",
    "class": "especialista",
    "description": "Você projeta mecanismos usados em Hygieia para controlar criaturas, cobaias e manifestações anômalas. Seus equipamentos combinam sensores, campos eletromagnéticos e materiais cuja origem não aparece nas notas fiscais.",
    "milestones": [
      {
        "nex": 10,
        "name": "Módulo Hygieia",
        "description": "Com uma ação padrão e 2 PD, você instala um módulo em um espaço desocupado adjacente.\n\nO módulo possui:\n\n• Defesa 15;\n• 15 PV;\n• tamanho Minúsculo;\n• duração até o fim da cena.\n\nVocê só pode manter um módulo ativo por vez. Escolha seu protocolo quando o instala.\n\nCampo restritor\nA área em um raio de 3m ao redor do módulo é terreno difícil para criaturas hostis.\n\nCampo de rastreamento\nAliados na área recebem +5 em Percepção para perceber criaturas, movimentos e ameaças.\n\nCampo estabilizador\nAliados na área recebem +2 em testes para resistir ou escapar de manobras, condições de movimento e efeitos que tentem empurrá-los ou derrubá-los."
      },
      {
        "nex": 40,
        "name": "Rede de segurança",
        "description": "Você pode manter até dois módulos ativos simultaneamente.\n\nSeus módulos passam a possuir Defesa 20 e 30 PV, e o raio de seus campos aumenta para 4,5m.\n\nAlém disso, uma vez por rodada, quando uma criatura hostil entra ou começa seu turno na área de um módulo, você pode gastar 1 PD. Ela faz um teste de Reflexos contra sua DT de Intelecto.\n\nSe falhar, o deslocamento dela termina imediatamente."
      },
      {
        "nex": 65,
        "name": "Contramedida automática",
        "description": "Quando uma criatura aliada dentro da área de um módulo sofre dano, você pode gastar uma reação e 3 PD para redirecionar parte do impacto.\n\nO módulo reduz o dano em 20 pontos, mas perde uma quantidade de PV igual ao dano reduzido.\n\nCaso seja destruído dessa maneira, você pode escolher um efeito:\n\n• empurrar todas as criaturas hostis adjacentes a ele em 3m;\n• fornecer cobertura aos aliados em sua área até o início do seu próximo turno;\n• liberar uma descarga que deixa criaturas hostis adjacentes vulneráveis por uma rodada.\n\nUma criatura pode ser protegida apenas uma vez por rodada por esta habilidade."
      },
      {
        "nex": 99,
        "name": "Complexo de contenção",
        "description": "Uma vez por cena, com uma ação completa e 8 PD, você instala quatro módulos especiais em pontos desocupados em alcance médio.\n\nEles não podem ser destruídos e formam uma zona entre si até o fim da cena.\n\nCriaturas hostis dentro da zona:\n\n• consideram toda a área terreno difícil;\n• não podem realizar reações;\n• não podem se teleportar voluntariamente;\n• sofrem –5 em testes para escapar de manobras e efeitos de movimento.\n\nQuando uma criatura hostil tenta sair da zona, deve fazer um teste de Reflexos contra sua DT de Intelecto. Se falhar, seu movimento termina na borda.\n\nA estrutura registra tudo o que ocorre dentro dela.\n\nInclusive acontecimentos que ainda não aconteceram."
      }
    ]
  },
  {
    "id": "analista-de-sistemas-maximon",
    "name": "Analista de Sistemas Maximón",
    "class": "especialista",
    "description": "Você opera equipamentos desenvolvidos para localizar interferências paranormais em redes, câmeras e sistemas digitais. Diferente de um ocultista, você não conjura através das máquinas. Você apenas descobriu que elas estão sempre observando.",
    "milestones": [
      {
        "nex": 10,
        "name": "Drone de telemetria",
        "description": "Você possui um pequeno drone de reconhecimento.\n\nO drone possui:\n\n• Defesa 15;\n• 10 PV;\n• deslocamento de voo 12m;\n• tamanho Minúsculo.\n\nEle não realiza ataques e age durante seu turno. Uma vez por turno, você pode movimentá-lo até o deslocamento dele como uma ação livre.\n\nVocê pode realizar testes de Percepção, Investigação e Tecnologia como se estivesse no espaço do drone.\n\nAlém disso, uma vez por rodada, quando um aliado em alcance curto do drone faz um teste de perícia, você pode gastar uma reação e 1 PD para fornecer +2 no teste.\n\nVocê deve declarar o uso após a rolagem, mas antes de o mestre anunciar o resultado.\n\nSe o drone for destruído, pode reconstruí-lo usando uma ação de interlúdio."
      },
      {
        "nex": 40,
        "name": "Acesso administrativo",
        "description": "O bônus de Drone de Telemetria aumenta para +5.\n\nVocê também pode realizar testes de Tecnologia através do drone para operar ou invadir aparelhos eletrônicos em alcance curto dele.\n\nCom uma ação de movimento e 2 PD, você pode tentar uma das seguintes ações contra um dispositivo eletrônico percebido pelo drone:\n\n• desligá-lo;\n• bloquear suas comunicações;\n• apagar ou copiar seus dados;\n• assumir temporariamente seu controle.\n\nFaça um teste de Tecnologia contra a DT determinada pelo mestre. O efeito permanece até o fim da cena ou até alguém restaurar o aparelho."
      },
      {
        "nex": 65,
        "name": "Algoritmo preditivo",
        "description": "O sistema começa a reconhecer movimentos, padrões de ataque e alterações comportamentais.\n\nUma vez por rodada, quando um aliado em alcance curto do drone falha em um teste de ataque ou resistência, você pode gastar uma reação e 3 PD para permitir que ele repita o teste.\n\nEle deve utilizar o segundo resultado.\n\nApós utilizar esta habilidade, as câmeras do drone apresentam por alguns segundos imagens de diferentes resultados possíveis para aquele acontecimento."
      },
      {
        "nex": 99,
        "name": "Rede Maximón",
        "description": "Uma vez por cena, com uma ação padrão e 8 PD, você conecta todos os aparelhos eletrônicos em alcance extremo.\n\nAté o fim da cena:\n\n• você conhece a localização aproximada de todas as criaturas percebidas por algum aparelho conectado;\n• aliados conectados não podem ser surpreendidos;\n• aliados conectados recebem +5 em Iniciativa, Percepção e Reflexos;\n• seu drone não pode ser destruído;\n• o alcance de suas habilidades de drone aumenta para médio.\n\nUma vez por rodada, você também pode permitir que um aliado conectado utilize uma reação para se deslocar até metade do próprio deslocamento.\n\nDurante o efeito, todos os aparelhos conectados exibem a mesma mensagem:\n\nO INCIDENTE JÁ FOI PREVISTO."
      }
    ]
  },
  {
    "id": "pesquisador-de-especimes",
    "name": "Pesquisador de Espécimes",
    "class": "especialista",
    "description": "Você estudou criaturas, cobaias e mutações recuperadas pelas equipes da Panacea. Seu trabalho era descobrir como funcionavam. Seu verdadeiro talento é descobrir como fazê-las parar.",
    "milestones": [
      {
        "nex": 10,
        "name": "Dossiê vivo",
        "description": "Com uma ação de movimento e 2 PD, escolha uma criatura visível e faça um teste apropriado à natureza dela:\n\n• Ciências;\n• Investigação;\n• Medicina;\n• Ocultismo;\n• Sobrevivência.\n\nA DT básica é 20, mas pode ser alterada pelo mestre conforme a raridade do espécime.\n\nSe passar, a criatura se torna seu espécime analisado até o fim da cena. Você também pode fazer uma pergunta ao mestre:\n\n• qual é sua resistência mais baixa;\n• qual é sua resistência mais alta;\n• se possui alguma resistência ou imunidade aparente;\n• qual é seu principal método de movimentação;\n• qual sentido ou capacidade utiliza para localizar vítimas;\n• se apresenta alguma fraqueza física ou comportamental perceptível.\n\nUma vez por rodada, quando você ou um aliado faz um teste diretamente contra o espécime analisado, pode gastar uma reação e 1 PD para fornecer +2 no teste.\n\nVocê só pode manter um espécime analisado por vez."
      },
      {
        "nex": 40,
        "name": "Hipótese confirmada",
        "description": "Quando passa em um teste para identificar uma criatura, ela se torna automaticamente seu espécime analisado, sem exigir ação ou PD adicional.\n\nVocê pode fazer duas perguntas ao mestre, em vez de uma, e o bônus fornecido por Dossiê Vivo aumenta para +5.\n\nAlém disso, você pode analisar uma criatura apenas através de vestígios, imagens ou amostras biológicas, embora o mestre possa aumentar a DT."
      },
      {
        "nex": 65,
        "name": "Explorar falha",
        "description": "Uma vez por rodada, quando um ataque acerta seu espécime analisado, você pode gastar uma reação e 3 PD para indicar um ponto vulnerável.\n\nO ataque:\n\n• causa +3d6 de dano do mesmo tipo;\n• ignora 10 pontos de resistência a dano.\n\nO dano adicional não é multiplicado em um acerto crítico.\n\nVocê precisa conseguir se comunicar com o atacante ou estar realizando o ataque."
      },
      {
        "nex": 99,
        "name": "Modelo completo",
        "description": "Quando analisa uma criatura, você pode considerar todas as criaturas do mesmo tipo na cena como espécimes analisados.\n\nContra esses espécimes:\n\n• seus aliados ignoram 10 pontos de resistência a dano;\n• cobertura e camuflagem concedem apenas metade de seus benefícios;\n• seus aliados recebem +5 em testes de resistência contra habilidades já utilizadas pelos espécimes durante a cena.\n\nUma vez por cena, quando um espécime utiliza uma habilidade que você já tenha presenciado, você pode gastar uma reação e 6 PD para anunciar uma contramedida.\n\nTodos os aliados que possam ouvi-lo recebem resistência 20 contra o dano dessa habilidade e +5 em testes para resistir a seus demais efeitos.\n\nA Panacea chama isso de compreensão científica.\n\nAs criaturas chamam de caça."
      }
    ]
  },
  {
    "id": "coordenador-de-incidentes",
    "name": "Coordenador de Incidentes",
    "class": "especialista",
    "description": "Você foi treinado para administrar crises corporativas: invasões, vazamentos, fugas de cobaias, mortes de funcionários e acontecimentos que oficialmente nunca ocorreram. Para você, uma missão é apenas um projeto com prazo curto e mortalidade elevada.",
    "milestones": [
      {
        "nex": 10,
        "name": "Plano de contingência",
        "description": "Uma vez por cena, com uma ação padrão e 2 PD, escolha um número de aliados em alcance curto igual ao seu Intelecto, mínimo um.\n\nCada aliado recebe uma diretriz à escolha.\n\nAvançar\nO aliado pode consumir a diretriz como reação para se deslocar até 3m.\nEsse movimento não provoca reações.\n\nResistir\nO aliado pode consumir a diretriz após rolar um teste de resistência para receber +2 no resultado.\nEle deve decidir antes de saber se passou ou falhou.\n\nExecutar\nO aliado pode consumir a diretriz após rolar um teste de perícia ou ataque para receber +2 no resultado.\n\nCada diretriz pode ser utilizada apenas uma vez e desaparece no fim da cena."
      },
      {
        "nex": 40,
        "name": "Cadeia de comando",
        "description": "Você pode fornecer duas diretrizes diferentes para cada aliado afetado.\n\nOs benefícios também aumentam:\n\n• Avançar: o aliado se desloca até metade do próprio deslocamento.\n• Resistir: fornece +5 no teste.\n• Executar: fornece +5 no teste.\n\nQuando um aliado utiliza uma diretriz, você pode imediatamente trocar a diretriz ainda não utilizada dele por outra."
      },
      {
        "nex": 65,
        "name": "Reatribuição emergencial",
        "description": "Uma vez por rodada, quando um aliado em alcance médio falha em um teste de perícia, você pode gastar uma reação e 3 PD para assumir a coordenação da tarefa.\n\nFaça um teste de Tática ou Profissão contra a mesma DT.\n\nSe seu resultado for suficiente, o teste do aliado é considerado um sucesso. Você deve conseguir observar ou se comunicar com ele.\n\nEsta habilidade não pode substituir testes de ataque ou resistência."
      },
      {
        "nex": 99,
        "name": "Operação impecável",
        "description": "Uma vez por cena, com uma ação padrão e 8 PD, você assume controle total da operação até o fim da cena.\n\nEnquanto puderem ouvi-lo, você e seus aliados:\n\n• não podem ser surpreendidos;\n• recebem +5 em Iniciativa;\n• podem utilizar uma diretriz por rodada sem consumi-la;\n• podem realizar a ação ajudar como reação;\n• não ficam desprevenidos por flanqueamento.\n\nAlém disso, uma vez por rodada, quando um aliado falha em um teste, você pode permitir que ele repita a rolagem sem gastar PD adicional.\n\nEle deve aceitar o segundo resultado.\n\nApós a missão, a Panacea provavelmente atribuirá o sucesso à administração superior.\n\nAs mortes serão registradas como falhas individuais."
      }
    ]
  }
];
